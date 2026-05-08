"use client";

import React, { useEffect, useState } from 'react'
import {
  useCreateUserListingMutation,
  useUpdateUserListingMutation,
} from '@/hooks/mutations/useUserListingMutations';
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PaymentDialog from './PaymentDialog';
import type { ScanResult } from '@/services/userListingsService';
import { SocialLinks } from './Step2';
import { toast } from 'react-toastify';

interface Step3Props {
  draftId: string | null;
  onPaymentSuccess?: () => void;
  scanResult: ScanResult | null;
  contractAddress: string;
  selectedNetwork: string;
  profilePreview: string | null;
  bannerPreview: string | null;
  logoUrl?: string;
  bannerUrl?: string;
  bio?: string;
  links?: SocialLinks;
  /** From saved listing (`mine/{id}`) when resuming */
  initialTitle?: string;
  initialDescription?: string;
}

function extractListingIdFromCreateResponse(result: unknown): string | undefined {
  if (!result || typeof result !== 'object') return undefined;
  const record = result as Record<string, unknown>;
  const topLevelId = record.id ?? record.listingId;
  if (typeof topLevelId === 'string' || typeof topLevelId === 'number') {
    return String(topLevelId);
  }
  const data = record.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    const nestedId = nested.id ?? nested.listingId;
    if (typeof nestedId === 'string' || typeof nestedId === 'number') {
      return String(nestedId);
    }
  }
  return undefined;
}

export default function Step3({ 
  draftId,
  onPaymentSuccess,
  scanResult,
  contractAddress,
  selectedNetwork,
  profilePreview,
  bannerPreview,
  logoUrl = '',
  bannerUrl = '',
  bio,
  links,
  initialTitle = '',
  initialDescription = '',
}: Step3Props) {
  const updateListingMutation = useUpdateUserListingMutation();
  const createListingMutation = useCreateUserListingMutation();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [listingId, setListingId] = useState<string | null>(null);
  const [isCreatingListing, setIsCreatingListing] = useState(false);

  useEffect(() => {
    setTitle(initialTitle ?? '');
  }, [initialTitle]);

  useEffect(() => {
    setDescription(initialDescription ?? '');
  }, [initialDescription]);

  const handleProceed = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    if (!scanResult || !contractAddress) {
      toast.error('Please complete Step 1 (scan token) first');
      return;
    }

    const nested = scanResult.details?.details as
      | { risk_score?: number; eligible?: boolean; minimum_required_score?: number }
      | undefined;
    const riskScore = Number(
      scanResult.risk_score ??
        nested?.risk_score ??
        scanResult.details?.risk_score ??
        0,
    );
    const minRequired =
      scanResult.minimum_required_score ??
      scanResult.details?.minimum_required_score ??
      nested?.minimum_required_score ??
      50;
    const backendEligible =
      scanResult.eligible === true ||
      scanResult.details?.eligible === true ||
      nested?.eligible === true;
    if (!backendEligible && riskScore < minRequired) {
      toast.error(
        `Listing requires eligibility or a risk score of at least ${minRequired}.`,
      );
      return;
    }

    setIsCreatingListing(true);

    try {
      if (draftId) {
        await updateListingMutation.mutateAsync({
          id: draftId,
          payload: {
            title: title.trim(),
            description: description.trim(),
          },
        });
        setListingId(draftId);
        setPaymentDialogOpen(true);
        toast.success('Draft updated. Proceed to payment.');
      } else {
        const nestedDetails = scanResult?.details?.details;
        const tier = nestedDetails?.tier || scanResult?.details?.tier || scanResult?.tier || 'UNQUALIFIED';
        const riskScore = nestedDetails?.risk_score || scanResult?.details?.risk_score || scanResult?.risk_score || 0;

        const payload = {
          contractAddr: contractAddress.trim(),
          chain: selectedNetwork.toUpperCase(),
          title: title.trim(),
          description: description.trim(),
          bio: bio || undefined,
          logoUrl: logoUrl || undefined,
          bannerUrl: bannerUrl || undefined,
          vettingTier: tier,
          vettingScore: riskScore,
          links: {
            website: links?.website || undefined,
            twitter: links?.twitter || undefined,
            telegram: links?.telegram || undefined,
            discord: links?.discord || undefined,
          },
        };

        const result = await createListingMutation.mutateAsync(payload);
        const createdListingId = extractListingIdFromCreateResponse(result);

        if (!createdListingId) {
          throw new Error('Listing created but no ID returned');
        }

        setListingId(createdListingId);
        setPaymentDialogOpen(true);
        toast.success('Listing created! Proceed to payment.');
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Listing created but no ID returned'
      ) {
        toast.error(error.message);
      }
      /* Other failures: create/update mutations already toast via onError */
    } finally {
      setIsCreatingListing(false);
    }
  };

  return (
    <>
      <div className="mt-6 space-y-4">
        <div>
        <label htmlFor="title" className="font-medium">
          Title
          </label>

          <Input 
            id='title' 
            placeholder='Ex "Aptos NFT Artist for Hire"...' 
            className="bg-white/5 border-[0.2px] h-12 mt-4 rounded-lg border-white/20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
        <label htmlFor="description" className="font-medium">
          Description
          </label>

          <Input 
            id='description' 
            placeholder="Explain what you're offering or what you're looking for..." 
            className="bg-white/5 border-[0.2px] h-12 mt-4 rounded-lg border-white/20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="font-medium">
          Additional links(<span className='text-white/50'>Optional</span>)
          </label>
          
          <span className='flex items-center justify-center max-w-60 h-12 gap-2 rounded-lg border-[0.2px] border-white/20 mt-4'>
              <Plus size={16} color='#FFFFFF' />
              <p className='text-white/50'>Add a link</p>
            </span>
        </div>

        <Button 
          onClick={handleProceed}
          disabled={isCreatingListing || !title.trim() || !description.trim()}
          className="font-medium mt-4 mb-6 w-full gap-2 bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] rounded-lg h-9 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingListing ? 'Creating Listing...' : 'Proceed'}
        </Button>
      </div>

      {/* Payment Dialog */}
      {listingId && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          projectTitle={title || "Project Listing"}
          listingId={listingId}
          listingFee={5}
          onPaymentSuccess={onPaymentSuccess}
        />
      )}
    </>
  );
}
