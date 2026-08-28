"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { marketplaceService, MarketplacePricingCatalog } from '@/services/marketplaceService';

const AdPaymentDialog = dynamic(
  () => import('@/app/marketplace/post-ad/features/AdPaymentDialog'),
  { ssr: false },
);

interface PreviewStepProps {
  formData: {
    category?: string;
    subcategory?: string;
    projectName?: string;
    adTitle?: string;
    projectDescription?: string;
    blockchainFocus?: string;
    roleType?: string;
    toolsStack?: string;
    paymentType?: string;
    amount?: string;
    deadline?: string;
    noFixedDeadline?: boolean;
    visibility?: string;
    boostOptions?: Record<string, boolean>;
    imagePreviews?: string[];
  };
  onBack: () => void;
  onPublish: () => void;
  onRequestPublish: () => void;
  paymentDialogOpen: boolean;
  onPaymentDialogOpenChange: (open: boolean) => void;
  draftAdId: string | null;
  savingDraft?: boolean;
  /** Persist draft on server immediately before payment (create or update). */
  ensureDraftSaved?: () => Promise<string | null>;
}

export default function PreviewStep({
  formData,
  onBack,
  onPublish,
  onRequestPublish,
  paymentDialogOpen,
  onPaymentDialogOpenChange,
  draftAdId,
  savingDraft = false,
  ensureDraftSaved,
}: PreviewStepProps) {
  const [pricingCatalog, setPricingCatalog] = useState<MarketplacePricingCatalog>({});
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.getElementById('preview-step-header')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, []);

  useEffect(() => {
    let active = true;
    marketplaceService.getPricing().then((catalog) => {
      if (active) setPricingCatalog(catalog);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const visibilityIdForPricing = formData.visibility?.trim();
  const hasValidVisibility = visibilityIdForPricing === 'free';
  const categoryDefinition = pricingCatalog.categories?.find((item) => item.id === formData.category);
  const normalizedSubcategory = String(formData.subcategory || '').trim().toLowerCase();
  const subcategoryDefinition = categoryDefinition?.subcategories.find((item) =>
    item.id.toLowerCase() === normalizedSubcategory || item.name.toLowerCase() === normalizedSubcategory,
  );
  const categoryFee = Number(subcategoryDefinition?.priceUsd ?? categoryDefinition?.defaultPriceUsd ?? 0);
  const addOnPrices = new Map(pricingCatalog.addons?.map((item) => [item.id, Number(item.priceUsd)]) ?? []);

  const subtotal = (() => {
    let total = categoryFee;
    if (formData.boostOptions?.['auto-bump']) total += addOnPrices.get('AUTO_BUMP_3') ?? 0;
    if (formData.boostOptions?.['homepage-spotlight']) total += addOnPrices.get('HOMEPAGE_SPOTLIGHT') ?? 0;
    if (formData.boostOptions?.['urgent-tag']) total += addOnPrices.get('URGENT_TAG') ?? 0;
    if (formData.boostOptions?.['multi-chain-tag']) total += addOnPrices.get('MULTI_CHAIN_TAG') ?? 0;

    return total;
  })();

  const calculateSubtotal = () => subtotal;

  const getCategoryName = () => {
    return categoryDefinition?.name || formData.category || 'N/A';
  };

  const visibilityOptions = [{ id: 'free', description: 'Listed for 28 days', price: '$0' }];

  const boostOptions = [
    { id: 'auto-bump', description: 'Pushes your ad to the top every 24h for 3 days', price: `$${addOnPrices.get('AUTO_BUMP_3') ?? 0}` },
    { id: 'homepage-spotlight', description: 'Displayed on homepage under "Top Picks"', price: `$${addOnPrices.get('HOMEPAGE_SPOTLIGHT') ?? 0}` },
    { id: 'urgent-tag', description: 'Red urgency tag, filterable', price: `$${addOnPrices.get('URGENT_TAG') ?? 0}` },
    { id: 'multi-chain-tag', description: 'Appear under multiple blockchains', price: `$${addOnPrices.get('MULTI_CHAIN_TAG') ?? 0}` },
  ];

  const visibilityId = visibilityIdForPricing;
  const selectedVisibility =
    visibilityId && visibilityOptions.some((o) => o.id === visibilityId)
      ? visibilityOptions.find((o) => o.id === visibilityId)!
      : null;

  const selectedBoostOptions = boostOptions.filter((o) => formData.boostOptions?.[o.id] === true);

  const paymentBreakdown = (() => {
    const items: { label: string; price: number }[] = [];
    if (formData.category && formData.subcategory) {
      items.push({ label: 'Category', price: categoryFee });
    }
    if (hasValidVisibility && formData.visibility) {
      const visId = formData.visibility;
      const visLabels: Record<string, string> = {
        free: 'Visibility: Free',
        plus: 'Visibility: Plus',
        premium: 'Visibility: Premium',
      };
      const visPrices: Record<string, number> = { free: 0 };
      items.push({ label: visLabels[visId] ?? 'Visibility', price: visPrices[visId] ?? 0 });
    }
    const boostLabels: Record<string, string> = {
      'auto-bump': 'Auto-Bump (3 days)',
      'homepage-spotlight': 'Homepage Spotlight',
      'urgent-tag': 'Urgent Tag',
      'multi-chain-tag': 'Multi-Chain Tag',
    };
    const boostPrices: Record<string, number> = {
      'auto-bump': addOnPrices.get('AUTO_BUMP_3') ?? 0,
      'homepage-spotlight': addOnPrices.get('HOMEPAGE_SPOTLIGHT') ?? 0,
      'urgent-tag': addOnPrices.get('URGENT_TAG') ?? 0,
      'multi-chain-tag': addOnPrices.get('MULTI_CHAIN_TAG') ?? 0,
    };
    (Object.keys(boostPrices) as (keyof typeof boostPrices)[]).forEach((id) => {
      if (formData.boostOptions?.[id]) {
        items.push({ label: boostLabels[id], price: boostPrices[id] });
      }
    });
    return items;
  })();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto mt-15">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-[#27272A] flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back To Edit
          </Button>
          <h2 id="preview-step-header" className="text-2xl font-bold text-white">
            Review Your Ad Before Publishing
          </h2>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        <div className="border-[0.2px] border-white/20 rounded-[20px] px-6 sm:px-8 md:px-12 lg:px-25 py-10 md:py-15">
        {/* Ad Content Section */}
        <div className="mb-6 space-y-6">
          {/* Project Name */}
          <div>
            <h3 className="text-white mb-2 block">Project Name</h3>
            <p className="font-semibold text-white text-sm">{formData.projectName || 'N/A'}</p>
          </div>

          {/* Ad Title */}
          <div>
            <h3 className="text-white mb-2 block">Ad Title (short headline)</h3>
            <p className="text-white text-sm">{formData.adTitle || 'N/A'}</p>
          </div>

          {/* Upload Images */}
          <div>
            <h3 className="text-white mb-2 block">Uploaded Images</h3>
            <div className="flex gap-3 flex-wrap">
              {[0, 1, 2].map((index) => {
                const src = formData.imagePreviews?.[index];
                return (
                  <div
                    key={index}
                    className="w-32 h-32 bg-[#141414] rounded-lg flex items-center justify-center overflow-hidden"
                  >
                    {src ? (
                      <img src={src} alt={`Ad ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#606060] text-xs">Image {index + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Description */}
          <div className="w-full">
            <h3 className="text-white mb-2 block">Project Description</h3>
            <div>
              <p className="text-white text-sm whitespace-pre-wrap break-words">
                {formData.projectDescription || 'N/A'}
              </p>
            </div>
          </div>

          {/* Project Specifications */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Blockchain Focus</h3>
              <p className="text-[#A1A1AA]">{formData.blockchainFocus || 'N/A'}</p>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Role Type</h3>
              <p className="text-[#A1A1AA]">{formData.roleType || 'N/A'}</p>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Tools/Stack</h3>
              <p className="text-[#A1A1AA]">{formData.toolsStack || 'N/A'}</p>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Payment {formData.paymentType || 'USDT'}</h3>
              <p className="text-[#A1A1AA]">{formData.amount || 'N/A'} {formData.paymentType || 'USDT'}</p>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Deadline</h3>
              <p className="text-[#A1A1AA]">
                {formData.noFixedDeadline ? 'No fixed deadline' : (formData.deadline || 'N/A')}
              </p>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[18px] text-white mb-2 block">Category</label>
            <div className="border-t-[0.2px] border-0 border-white/20 mt-5 mb-6"></div>
            <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-[4px]">
              <div className="bg-[#141414] rounded-[4px] py-4 px-5 flex items-center justify-between">
                <span className="text-white">{getCategoryName()}</span>
                <span className="text-[#A1A1AA] uppercase">{formData.subcategory || 'N/A'}</span>
                <span className="text-[#FF9631] font-semibold">$5</span>
              </div>
            </div>
          </div>

          {/* Visibility Options Section — preview: only the chosen tier, or "None selected" */}
          <div>
            <h3 className="text-[18px] text-white mb-4">
              Choose how visible you want this post to be
            </h3>
            <div className="border-t-[0.2px] border-0 border-white/20 mt-5 mb-6"></div>
            {selectedVisibility ? (
              <div className="rounded-[4px] p-[1px] bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)]">
                <div className="flex items-center justify-between rounded-[4px] py-4 px-5 bg-[#141414]">
                  <div className="text-white font-semibold capitalize">{selectedVisibility.id}</div>
                  <div className="text-sm text-[#A1A1AA]">{selectedVisibility.description}</div>
                  <div className="text-[#FF9631] font-semibold">{selectedVisibility.price}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#A1A1AA]">None selected</p>
            )}
          </div>

          {/* Boost Ad's Reach Section — preview: only chosen boosts, or "None selected" */}
          <div>
            <h3 className="text-[18px] text-white mb-4">
              Boost your ad&apos;s reach
            </h3>
            <div className="border-t-[0.2px] border-0 border-white/20 mt-5 mb-6"></div>
            {selectedBoostOptions.length > 0 ? (
              <div className="space-y-3">
                {selectedBoostOptions.map((option) => (
                  <div
                    key={option.id}
                    className="rounded-[4px] p-[1px] bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)]"
                  >
                    <div className="flex items-center justify-between rounded-[4px] py-4 px-5 bg-[#141414]">
                      <div className="text-white font-semibold">
                        {option.id === 'auto-bump'
                          ? 'Auto-Bump (3 days)'
                          : option.id === 'homepage-spotlight'
                            ? 'Homepage Spotlight'
                            : option.id === 'urgent-tag'
                              ? 'Urgent Tag'
                              : 'Multi-Chain Tag'}
                      </div>
                      <div className="text-sm text-[#A1A1AA]">{option.description}</div>
                      <div className="text-[#FF9631] font-semibold">{option.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#A1A1AA]">None selected</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={onRequestPublish}
            disabled={savingDraft}
            className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70"
          >
            {savingDraft ? 'Saving…' : 'Publish'}
          </Button>
          <div className="text-white">
            Sub-Total: <span className="font-semibold text-[#FF9631]">${calculateSubtotal()}</span>
          </div>
        </div>
        </div>
      </div>

      <AdPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={onPaymentDialogOpenChange}
        projectTitle={formData.projectName || formData.adTitle || 'Ad'}
        adsId={draftAdId ?? ''}
        adFee={subtotal}
        breakdown={paymentBreakdown}
        onPaymentSuccess={() => {
          onPaymentDialogOpenChange(false);
          onPublish();
        }}
        ensureDraftSaved={ensureDraftSaved}
      />
    </div>
  );
}




