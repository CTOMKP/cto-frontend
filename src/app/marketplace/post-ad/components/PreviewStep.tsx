"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

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
  };
  onBack: () => void;
  onPublish: () => void;
}

export default function PreviewStep({ formData, onBack, onPublish }: PreviewStepProps) {
  const calculateSubtotal = () => {
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
  };

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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
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

        {/* Ad Content Section */}
        <div className="mb-8 space-y-6">
          {/* Project Name */}
          <div>
            <h3 className="text-sm font-semibold text-[#A1A1AA] mb-2">Project Name</h3>
            <p className="text-white text-lg">{formData.projectName || 'N/A'}</p>
          </div>

          {/* Ad Title */}
          <div>
            <h3 className="text-sm font-semibold text-[#A1A1AA] mb-2">Ad Title (short headline)</h3>
            <p className="text-white text-lg">{formData.adTitle || 'N/A'}</p>
          </div>

          {/* Upload Images */}
          <div>
            <h3 className="text-sm font-semibold text-[#A1A1AA] mb-2">Upload Images</h3>
            <div className="flex gap-3">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="w-32 h-32 bg-[#1A1A1A] border border-[#404040] rounded-lg flex items-center justify-center"
                >
                  <span className="text-[#606060] text-xs">Image {index}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Description */}
          <div>
            <h3 className="text-sm font-semibold text-[#A1A1AA] mb-2">Project Description</h3>
            <div className="bg-[#1A1A1A] border border-[#404040] rounded-lg p-4">
              <p className="text-white whitespace-pre-wrap">
                {formData.projectDescription || 'N/A'}
              </p>
            </div>
          </div>

          {/* Project Specifications */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#A1A1AA] mb-2">Blockchain Focus</h3>
              <p className="text-white">{formData.blockchainFocus || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#A1A1AA] mb-2">Role Type</h3>
              <p className="text-white">{formData.roleType || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#A1A1AA] mb-2">Tools/Stack</h3>
              <p className="text-white">{formData.toolsStack || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#A1A1AA] mb-2">Payment {formData.paymentType || 'USDT'}</h3>
              <p className="text-white">{formData.amount || 'N/A'} {formData.paymentType || 'USDT'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#A1A1AA] mb-2">Deadline</h3>
              <p className="text-white">
                {formData.noFixedDeadline ? 'No fixed deadline' : (formData.deadline || 'N/A')}
              </p>
            </div>
          </div>

          {/* Category */}
          <div>
            <h3 className="text-sm font-semibold text-[#A1A1AA] mb-2">Category</h3>
            <div className={`bg-[#1A1A1A] border rounded-lg py-3 px-4 flex items-center justify-between ${
              formData.category ? 'border-red-500' : 'border-[#404040]'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-white">{getCategoryName()}</span>
                <span className="text-[#A1A1AA] uppercase">{formData.subcategory || 'N/A'}</span>
              </div>
              <span className="text-white font-semibold">$5</span>
            </div>
          </div>
        </div>

        {/* Visibility Options Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-white mb-4">
            Choose how visible you want this post to be
          </h3>
          <div className="space-y-3">
            {visibilityOptions.map((option) => (
              <div
                key={option.id}
                className={`flex items-center justify-between py-3 px-4 rounded-lg border transition-colors ${
                  formData.visibility === option.id
                    ? 'bg-[#27272A] border-red-500'
                    : 'bg-[#1A1A1A] border-[#404040]'
                }`}
              >
                <div className="text-left">
                  <div className="text-white font-semibold capitalize mb-1">{option.id}</div>
                  <div className="text-sm text-[#A1A1AA]">{option.description}</div>
                </div>
                <div className="text-white font-semibold">{option.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Boost Ad's Reach Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-white mb-4">
            Boost your ad's reach
          </h3>
          <div className="space-y-3">
            {boostOptions.map((option) => (
              <div
                key={option.id}
                className={`flex items-center justify-between py-3 px-4 rounded-lg border transition-colors ${
                  formData.boostOptions?.[option.id]
                    ? 'bg-[#27272A] border-red-500'
                    : 'bg-[#1A1A1A] border-[#404040]'
                }`}
              >
                <div className="text-left">
                  <div className="text-white font-semibold mb-1">
                    {option.id === 'auto-bump' ? 'Auto-Bump (3 days)' : 
                     option.id === 'homepage-spotlight' ? 'Homepage Spotlight' :
                     option.id === 'urgent-tag' ? 'Urgent Tag' :
                     'Multi-Chain Tag'}
                  </div>
                  <div className="text-sm text-[#A1A1AA]">{option.description}</div>
                </div>
                <div className="text-white font-semibold">{option.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={onPublish}
            className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
          >
            Publish
          </Button>
          <div className="text-white">
            Sub-Total: <span className="font-semibold">${calculateSubtotal()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}




