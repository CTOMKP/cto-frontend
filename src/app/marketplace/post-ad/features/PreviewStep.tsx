"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AdPaymentDialog from '@/components/AdPaymentDialog';

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
}: PreviewStepProps) {
  const subtotal = (() => {
    let total = 0;
    
    // Category price (if applicable)
    // Based on the image, category "Developer" with "FULL STACK" costs $5
    if (formData.category && formData.subcategory) {
      total += 5; // Category price
    }
    
    // Visibility pricing
    if (formData.visibility === 'plus') total += 5;
    if (formData.visibility === 'premium') total += 15;
    
    // Boost options pricing
    if (formData.boostOptions?.['auto-bump']) total += 7;
    if (formData.boostOptions?.['homepage-spotlight']) total += 20;
    if (formData.boostOptions?.['urgent-tag']) total += 5;
    if (formData.boostOptions?.['multi-chain-tag']) total += 10;

    return total;
  })();

  const calculateSubtotal = () => subtotal;

  const getCategoryName = () => {
    const categoryMap: Record<string, string> = {
      'developers': 'Developer',
      'design-branding': 'Design & Branding',
      'shilling-marketing': 'Shilling & Marketing',
      'tokenomics-strategy': 'Tokenomics & Strategy',
      'advisory-leadership': 'Advisory & Leadership',
      'community-operations': 'Community & Operations',
      'project-listings': 'Project Listings (For Takeover)',
      'nft-art': 'NFT & Art',
      'tools-services': 'Tools & Services',
      'writing-content': 'Writing & Content',
    };
    return categoryMap[formData.category || ''] || formData.category || 'N/A';
  };

  const visibilityOptions = [
    { id: 'free', description: 'Listed for 28 days', price: '$0' },
    { id: 'plus', description: 'Highlighted in listings + top for 1 day', price: '$5' },
    { id: 'premium', description: 'Top for 7 days + featured badge + show on homepage', price: '$15' },
  ];

  const boostOptions = [
    { id: 'auto-bump', description: 'Pushes your ad to the top every 24h for 3 days', price: '$7' },
    { id: 'homepage-spotlight', description: 'Displayed on homepage under "Top Picks"', price: '$20' },
    { id: 'urgent-tag', description: 'Red urgency tag, filterable', price: '$5' },
    { id: 'multi-chain-tag', description: 'Appear under multiple blockchains', price: '$10' },
  ];

  const paymentBreakdown = (() => {
    const items: { label: string; price: number }[] = [];
    if (formData.category && formData.subcategory) {
      items.push({ label: 'Category', price: 5 });
    }
    const visId = formData.visibility || 'free';
    const visLabels: Record<string, string> = { free: 'Visibility: Free', plus: 'Visibility: Plus', premium: 'Visibility: Premium' };
    const visPrices: Record<string, number> = { free: 0, plus: 5, premium: 15 };
    items.push({ label: visLabels[visId] ?? 'Visibility', price: visPrices[visId] ?? 0 });
    const boostLabels: Record<string, string> = {
      'auto-bump': 'Auto-Bump (3 days)',
      'homepage-spotlight': 'Homepage Spotlight',
      'urgent-tag': 'Urgent Tag',
      'multi-chain-tag': 'Multi-Chain Tag',
    };
    const boostPrices: Record<string, number> = {
      'auto-bump': 7,
      'homepage-spotlight': 20,
      'urgent-tag': 5,
      'multi-chain-tag': 10,
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
          <h2 className="text-2xl font-bold text-white">
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
            <h3 className="text-white mb-2 block">Upload Images</h3>
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
          <div>
            <h3 className="text-white mb-2 block">Project Description</h3>
            <div>
              <p className="text-white text-sm whitespace-pre-wrap">
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

          {/* Visibility Options Section */}
          <div>
            <h3 className="text-[18px] text-white mb-4">
              Choose how visible you want this post to be
            </h3>
            <div className="border-t-[0.2px] border-0 border-white/20 mt-5 mb-6"></div>
            <div className="space-y-3">
              {visibilityOptions.map((option) => (
                <div
                  key={option.id}
                  className={`rounded-[4px] p-[1px] transition-all ${
                    formData.visibility === option.id
                      ? 'bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)]'
                      : 'bg-transparent'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between rounded-[4px] py-4 px-5 bg-[#141414] ${
                      formData.visibility === option.id ? '' : 'opacity-90'
                    }`}
                  >
                    <div className="text-white font-semibold capitalize">{option.id}</div>
                    <div className="text-sm text-[#A1A1AA]">{option.description}</div>
                    <div className="text-[#FF9631] font-semibold">{option.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boost Ad's Reach Section */}
          <div>
            <h3 className="text-[18px] text-white mb-4">
              Boost your ad&apos;s reach
            </h3>
            <div className="border-t-[0.2px] border-0 border-white/20 mt-5 mb-6"></div>
            <div className="space-y-3">
              {boostOptions.map((option) => (
                <div
                  key={option.id}
                  className={`rounded-[4px] p-[1px] transition-all ${
                    formData.boostOptions?.[option.id]
                      ? 'bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)]'
                      : 'bg-transparent'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between rounded-[4px] py-4 px-5 bg-[#141414] ${
                      formData.boostOptions?.[option.id] ? '' : 'opacity-90'
                    }`}
                  >
                    <div className="text-white font-semibold">
                      {option.id === 'auto-bump' ? 'Auto-Bump (3 days)' :
                       option.id === 'homepage-spotlight' ? 'Homepage Spotlight' :
                       option.id === 'urgent-tag' ? 'Urgent Tag' :
                       'Multi-Chain Tag'}
                    </div>
                    <div className="text-sm text-[#A1A1AA]">{option.description}</div>
                    <div className="text-[#FF9631] font-semibold">{option.price}</div>
                  </div>
                </div>
              ))}
            </div>
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
      />
    </div>
  );
}




