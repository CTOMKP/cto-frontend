"use client";

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PaymentDialog from './PaymentDialog';
import { userListingsService, ScanResult } from '@/services/userListingsService';
import { toast } from 'react-toastify';
import axios, { AxiosError } from 'axios';

interface Step3Props {
  onPaymentSuccess?: () => void;
  scanResult: ScanResult | null;
  contractAddress: string;
  selectedNetwork: string;
  profilePreview: string | null;
  bannerPreview: string | null;
  bio?: string;
}

export default function Step3({ 
  onPaymentSuccess,
  scanResult,
  contractAddress,
  selectedNetwork,
  profilePreview,
  bannerPreview,
  bio
}: Step3Props) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingId, setListingId] = useState<string | null>(null);
  const [isCreatingListing, setIsCreatingListing] = useState(false);

  const handleProceed = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    if (!scanResult || !contractAddress) {
      toast.error('Please complete Step 1 (scan token) first');
      return;
    }

    setIsCreatingListing(true);

    try {
      // Get tier and score from scan result (handle nested details)
      const nestedDetails = scanResult?.details?.details;
      const tier = nestedDetails?.tier || scanResult?.details?.tier || scanResult?.tier || 'UNQUALIFIED';
      const riskScore = nestedDetails?.risk_score || scanResult?.details?.risk_score || scanResult?.risk_score || 0;

      // Create listing payload
      const payload = {
        contractAddr: contractAddress.trim(),
        chain: selectedNetwork.toUpperCase(),
        title: title.trim(),
        description: description.trim(),
        bio: bio || undefined,
        logoUrl: profilePreview || undefined,
        bannerUrl: bannerPreview || undefined,
        vettingTier: tier,
        vettingScore: riskScore,
      };

      console.log('📝 Creating listing with payload:', payload);
      const result = await userListingsService.create(payload);
      
      // Handle wrapped response
      const listingData = result?.data || result;
      const createdListingId = listingData?.id || listingData?.listingId;

      if (!createdListingId) {
        throw new Error('Listing created but no ID returned');
      }

      console.log('✅ Listing created with ID:', createdListingId);
      setListingId(createdListingId);
      setPaymentDialogOpen(true);
      toast.success('Listing created! Proceed to payment.');
    } catch (error) {
      console.error('Failed to create listing:', error);
      let errorMsg = 'Failed to create listing';
      if (error instanceof Error) {
        errorMsg = error.message || errorMsg;
      } else if (axios.isAxiosError(error)) {
        errorMsg = (error.response?.data as { message?: string })?.message || error.message || errorMsg;
      }
      toast.error(errorMsg);
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
