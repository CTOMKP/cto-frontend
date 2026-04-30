"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCreateMarketplaceDraftMutation,
  useUpdateMarketplaceDraftMutation,
} from '@/hooks/mutations/useMarketplaceDraftMutations';
import { toast } from 'react-toastify';
import CategorySelectionStep from './features/CategorySelectionStep';
import ProjectDetailsStep, { ProjectDetailsData } from './features/ProjectDetailsStep';
import PreviewStep from './features/PreviewStep';
import { getUserId } from '@/lib/authSession';
import { pfpService } from '@/services/pfpService';
import { isApiError } from '@/lib/apiError';
import { toRecord, unwrapApiData } from '@/lib/apiResponse';
import { useSessionStore } from '@/lib/sessionStore';

type Step = 'category' | 'details' | 'preview';

interface FormData extends ProjectDetailsData {
  category?: string;
  subcategory?: string;
  postType?: 'LOOKING_FOR' | 'OFFERING';
}

/** Upload ad images via presign (same as cto-test-frontend pfpService.uploadProfileImage). Returns view URLs in order. */
async function uploadAdImages(files: (File | null)[], userId: string | null): Promise<string[]> {
  if (!userId) return [];
  const viewUrls: string[] = [];
  for (const file of files) {
    if (!file) continue;
    try {
      const { viewUrl } = await pfpService.uploadProfileImage(file, userId);
      viewUrls.push(viewUrl);
    } catch (err) {
      throw err;
    }
  }
  return viewUrls;
}

/** Allowed chain values from backend (uppercase). */
const CHAIN_VALUES = ['SOLANA', 'ETHEREUM', 'BASE', 'POLYGON', 'APTOS', 'MOVEMENT'] as const;

/** Build API draft payload from form data (matches backend validation). */
function buildDraftPayload(formData: FormData, imageUrls: string[]): Record<string, unknown> {
  const tier = (formData.visibility === 'plus' ? 'PLUS' : formData.visibility === 'premium' ? 'PREMIUM' : 'FREE') as string;
  const chainRaw = (formData.blockchainFocus ?? '').toUpperCase().replace(/\s+/g, '_');
  const chain = CHAIN_VALUES.includes(chainRaw as (typeof CHAIN_VALUES)[number]) ? chainRaw : undefined;

  const amountStr = formData.amount != null && formData.amount !== '' ? String(formData.amount).replace(/,/g, '') : '';
  const priceAmount = amountStr ? Number(amountStr) : undefined;
  const isValidAmount = typeof priceAmount === 'number' && !Number.isNaN(priceAmount);

  const raw: Record<string, unknown> = {
    postType: formData.postType || 'LOOKING_FOR',
    category: formData.category || undefined,
    subCategory: formData.subcategory || undefined,
    title: (formData.adTitle?.trim() || formData.projectName?.trim() || 'Untitled').trim() || 'Untitled',
    description: (formData.projectDescription?.trim() ?? '') || undefined,
    tags: [],
    contactInfo: {},
    chain: chain || undefined,
    offerType: formData.roleType || undefined,
    priceAmount: isValidAmount ? priceAmount : undefined,
    priceCurrency: formData.paymentType || undefined,
    images: imageUrls,
    tier,
    homepageSpotlight: !!formData.boostOptions?.['homepage-spotlight'],
    urgentTag: !!formData.boostOptions?.['urgent-tag'],
    multiChainTag: !!formData.boostOptions?.['multi-chain-tag'],
    deadline: formData.noFixedDeadline ? undefined : formData.deadline || undefined,
  };
  if (formData.boostOptions?.['auto-bump']) {
    raw.autoBumpDays = 3;
  }
  const payload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v === undefined) continue;
    if (k === 'tags' && Array.isArray(v) && v.length === 0) continue;
    if (k === 'contactInfo' && typeof v === 'object' && v !== null && Object.keys(v).length === 0) continue;
    payload[k] = v;
  }
  return payload;
}

export default function PostAdPage() {
  const sessionUserId = useSessionStore((s) => s.userId);
  const updateMarketplaceDraftMutation = useUpdateMarketplaceDraftMutation();
  const createMarketplaceDraftMutation = useCreateMarketplaceDraftMutation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('category');
  const [formData, setFormData] = useState<FormData>({});
  const [draftAdId, setDraftAdId] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Restore draft from "My ads" when user clicks a DRAFT card (saved to sessionStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem('marketplace_edit_draft');
      if (!raw) return;
      const ad = JSON.parse(raw) as Record<string, unknown>;
      sessionStorage.removeItem('marketplace_edit_draft');

      const tier = (ad.tier as string) || 'FREE';
      const visibility = tier === 'PLUS' ? 'plus' : tier === 'PREMIUM' ? 'premium' : 'free';
      const chain = (ad.chain as string) || '';
      const chainDisplay = chain ? chain.charAt(0).toUpperCase() + chain.slice(1).toLowerCase() : '';

      setFormData({
        category: (ad.category as string) || undefined,
        subcategory: (ad.subCategory as string) || undefined,
        postType: (ad.postType as 'LOOKING_FOR' | 'OFFERING') || 'LOOKING_FOR',
        projectName: (ad.title as string) || undefined,
        adTitle: (ad.title as string) || undefined,
        projectDescription: (ad.description as string) || undefined,
        blockchainFocus: chainDisplay || undefined,
        roleType: (ad.offerType as string) || undefined,
        toolsStack: undefined,
        paymentType: (ad.priceCurrency as string) || undefined,
        amount: ad.priceAmount != null ? String(ad.priceAmount) : undefined,
        deadline: undefined,
        noFixedDeadline: false,
        visibility,
        boostOptions: {
          'homepage-spotlight': !!(ad.homepageSpotlight as boolean),
          'auto-bump': !!((ad.autoBumpDays as number) > 0),
          'urgent-tag': !!(ad.urgentTag as boolean),
          'multi-chain-tag': !!(ad.multiChainTag as boolean),
        },
        imagePreviews: Array.isArray(ad.images) ? (ad.images as string[]) : [],
      });
      setDraftAdId((ad.id as string) || null);
      setCurrentStep('details');
    } catch (_) {}
  }, []);

  const ensureDraftSaved = useCallback(async (): Promise<string | null> => {
    try {
      let imageUrls = await uploadAdImages(formData.images ?? [], sessionUserId || getUserId());
      if (draftAdId && imageUrls.length === 0 && formData.imagePreviews?.length) {
        imageUrls = formData.imagePreviews.filter(
          (u): u is string => typeof u === 'string' && (u.startsWith('http') || u.startsWith('/'))
        );
      }
      const payload = buildDraftPayload(formData, imageUrls);
      if (draftAdId) {
        await updateMarketplaceDraftMutation.mutateAsync({
          id: draftAdId,
          payload,
        });
        return draftAdId;
      }
      const res = await createMarketplaceDraftMutation.mutateAsync(payload);
      const data = toRecord(unwrapApiData(res));
      const id = typeof data.id === 'string' ? data.id : null;
      if (id) setDraftAdId(id);
      return id;
    } catch (err: unknown) {
      if (isApiError(err) && err.status === 400) {
        toast.error(err.message || 'Failed to save draft');
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to save draft');
      }
      return null;
    }
  }, [
    formData,
    draftAdId,
    updateMarketplaceDraftMutation,
    createMarketplaceDraftMutation,
  ]);

  const handleCategoryNext = (data: { category: string; subcategory: string; postType?: 'LOOKING_FOR' | 'OFFERING' }) => {
    setFormData((prev: FormData) => ({ ...prev, ...data }));
    setCurrentStep('details');
  };

  const handleDetailsNext = (data: ProjectDetailsData) => {
    setFormData((prev: FormData) => ({ ...prev, ...data }));
    setCurrentStep('preview');
  };

  const handleDetailsBack = () => {
    setCurrentStep('category');
  };

  const handlePreviewBack = () => {
    setCurrentStep('details');
  };

  const handleRequestPublish = useCallback(async () => {
    setSavingDraft(true);
    try {
      const id = await ensureDraftSaved();
      if (id) {
        setPaymentDialogOpen(true);
      }
    } finally {
      setSavingDraft(false);
    }
  }, [ensureDraftSaved]);

  const handlePublish = useCallback(() => {
    // After successful payment, navigate to success page using the real ad id
    if (draftAdId) {
      router.push(`/marketplace/post-ad/successful/${encodeURIComponent(draftAdId)}`);
      return;
    }

    // Fallback: if for some reason we don't have an id, keep the old slug-based behavior
    const slug =
      formData.adTitle?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ||
      'your-listing';
    const title = formData.adTitle || 'Your ad';
    router.push(
      `/marketplace/post-ad/successful?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`
    );
  }, [draftAdId, formData.adTitle, router]);

  return (
    <>
      {currentStep === 'category' && (
        <CategorySelectionStep onNext={handleCategoryNext} />
      )}
      {currentStep === 'details' && (
        <ProjectDetailsStep
          onNext={handleDetailsNext}
          onBack={handleDetailsBack}
          initialData={formData}
        />
      )}
      {currentStep === 'preview' && (
        <PreviewStep
          formData={formData}
          onBack={handlePreviewBack}
          onPublish={handlePublish}
          onRequestPublish={handleRequestPublish}
          paymentDialogOpen={paymentDialogOpen}
          onPaymentDialogOpenChange={setPaymentDialogOpen}
          draftAdId={draftAdId}
          savingDraft={savingDraft}
        />
      )}
    </>
  );
}

