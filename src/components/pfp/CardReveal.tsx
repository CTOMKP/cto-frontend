"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { pfpService } from '@/services/pfpService';
import { toast } from 'react-toastify';

interface CardRevealProps {
  selectedCardId: number | null;
  onClose?: () => void;
}

// Trait mapping - maps card IDs to trait names
const TRAIT_MAP: Record<number, string> = {
  1: 'CTO',
  2: 'DEGEN',
  3: 'DEV',
  4: 'WHALE',
  5: 'ARTIST',
};

// Available trait variants for randomization
const TRAIT_VARIANTS: Record<string, string[]> = {
  'CTO': ['CTO', 'CTO2'],
  'DEGEN': ['DEGEN', 'DEGEN2'],
  'DEV': ['DEV'],
  'WHALE': ['WHALE', 'WHALE2', 'WHALE3', 'EARLYADT.WHALE'],
  'ARTIST': ['ARTIST', 'ARTIST2', 'ARTIST3'],
  'HACKER': ['HACKER', 'HACKER2', 'HACKER3'],
  'MOD': ['MOD', 'MOD2', 'MOD3'],
  'VISIONARY': ['VISIONARY', 'VISIONARY2'],
};

// Get trait image path with random variant selection
const getTraitImage = (traitName: string, cardId: number): string => {
  const variants = TRAIT_VARIANTS[traitName] || [traitName];
  // Use cardId to deterministically select a variant (so same card always shows same variant)
  const variantIndex = (cardId - 1) % variants.length;
  const selectedVariant = variants[variantIndex] || traitName;
  return `/mascots/TRAITS/${selectedVariant}.png`;
};

export const CardReveal: React.FC<CardRevealProps> = ({ selectedCardId, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);

  if (!selectedCardId) return null;

  const traitName = TRAIT_MAP[selectedCardId] || 'CTO';
  const baseSkinPath = '/mascots/SKIN/BASE SKIN.png';
  const stagePath = '/mascots/STAGE/STAGE.png';
  const traitPath = getTraitImage(traitName, selectedCardId);

  // Create composite image URL (this would ideally be done server-side or with canvas)
  // For now, we'll use the trait image as the main image
  const compositeImage = traitPath;

  const handleSavePFP = async () => {
    if (!compositeImage) {
      toast.error('No image to save');
      return;
    }

    setIsSaving(true);
    try {
      const result = await pfpService.savePFP(compositeImage);
      if (result.success) {
        toast.success(result.message || 'PFP saved successfully!');
        if (onClose) {
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (error: unknown) {
      console.error('Failed to save PFP:', error);
      let message = 'Failed to save PFP';
      if (error instanceof Error) {
        message = error.message || message;
      }
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative"
      >
        {/* Composite Mascot Image */}
        <div className="relative w-[221px] h-[326px] mb-6 flex items-center justify-center">
          {/* Base Skin Layer (background) */}
          <div className="absolute inset-0 z-0">
            <Image
              src={baseSkinPath}
              alt="Base Skin"
              fill
              className="object-contain"
            />
          </div>
          
          {/* Stage Layer (middle) */}
          <div className="absolute inset-0 z-10">
            <Image
              src={stagePath}
              alt="Stage"
              fill
              className="object-contain"
            />
          </div>
          
          {/* Trait Layer (foreground) */}
          <div className="absolute inset-0 z-20">
            <Image
              src={traitPath}
              alt={traitName}
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Trait Name Display */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-white mb-1">{traitName}</h3>
          <p className="text-sm text-gray-400">Your Mascot Trait</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mb-2">
          <Button 
            className="cta-gradient w-26.5 rounded-lg font-medium text-[14px] text-white h-[36px]"
            disabled={isSaving}
          >
            Upload pfp
          </Button>
          <Button 
            onClick={handleSavePFP}
            disabled={isSaving}
            className="rounded-lg w-26.5 border-[0.2px] border-[#FFFFFF20] font-medium text-[14px] text-[#FFFFFF50] disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'} <Save size={13} color="#FFFFFF50" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

