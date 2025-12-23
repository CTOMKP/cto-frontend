"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { pfpService } from '@/services/pfpService';
import { toast } from 'react-toastify';
import { usePrivy } from '@privy-io/react-auth';

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

/**
 * Composite mascot layers into a single canvas image (without stage layer)
 */
const compositeMascotImage = async (
  baseSkinPath: string,
  traitPath: string
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Set canvas size (matching the display size)
    canvas.width = 221;
    canvas.height = 326;

    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    const totalImages = 2;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw layers in order: base skin (background), trait (foreground)
        ctx.drawImage(images[0], 0, 0, canvas.width, canvas.height); // Base skin
        ctx.drawImage(images[1], 0, 0, canvas.width, canvas.height); // Trait

        // Convert canvas to blob, then to File
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'));
            return;
          }
          const file = new File([blob], 'mascot-pfp.png', { type: 'image/png' });
          resolve(file);
        }, 'image/png');
      }
    };

    const loadImage = (src: string, index: number) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        images[index] = img;
        checkAllLoaded();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    };

    // Load images (base skin and trait only, no stage)
    loadImage(baseSkinPath, 0);
    loadImage(traitPath, 1);
  });
};

export const CardReveal: React.FC<CardRevealProps> = ({ selectedCardId, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaved, setIsAutoSaved] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({ base: false, stage: false, trait: false });
  const [compositeFile, setCompositeFile] = useState<File | null>(null);
  const { user } = usePrivy();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const allImagesLoaded = imagesLoaded.base && imagesLoaded.stage && imagesLoaded.trait;

  const traitName = selectedCardId ? (TRAIT_MAP[selectedCardId] || 'CTO') : 'CTO';
  const baseSkinPath = '/mascots/SKIN/BASE SKIN.png';
  const stagePath = '/mascots/STAGE/STAGE.png';
  const traitPath = getTraitImage(traitName, selectedCardId || 0);

  // Get user ID from localStorage with fallback to Privy user.id
  const getUserId = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('cto_user_id');
      if (storedUserId) {
        return storedUserId;
      }
      // Fallback to Privy user.id if localStorage not available
      if (user?.id) {
        return user.id;
      }
    }
    return null;
  }, [user?.id]);

  // Check if authentication token exists
  const hasAuthToken = (): boolean => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cto_auth_token');
      return !!token;
    }
    return false;
  };

  // Reset state when card changes
  useEffect(() => {
    setIsAutoSaved(false);
    setImagesLoaded({ base: false, stage: false, trait: false });
    setCompositeFile(null);
    
    // Fallback: Mark all images as loaded after 2 seconds to prevent infinite loader
    // (in case onLoad events don't fire for any reason)
    const fallbackTimer = setTimeout(() => {
      setImagesLoaded({ base: true, stage: true, trait: true });
    }, 2000);
    
    return () => clearTimeout(fallbackTimer);
  }, [selectedCardId]);

  // Auto-save when images are loaded (card is revealed) - simplified trigger like main branch
  useEffect(() => {
    const autoSavePFP = async () => {
      if (!selectedCardId || !allImagesLoaded || isAutoSaved || isSaving) return;

      try {
        // Check if authentication token exists before proceeding
        if (!hasAuthToken()) {
          console.warn('Authentication token not found, skipping auto-save. Please ensure you are logged in.');
          return;
        }

        // Composite the mascot layers into a single image file (without stage)
        const file = await compositeMascotImage(baseSkinPath, traitPath);
        setCompositeFile(file); // Store for reuse in manual save
        
        // Get user ID from localStorage with fallback
        const userId = getUserId();
        if (!userId) {
          console.warn('User ID not found, skipping auto-save. Please ensure you are logged in.');
          return;
        }

        // Save PFP automatically with toast notification
        const result = await pfpService.savePFP(file, userId);
        
        if (result.success) {
          setIsAutoSaved(true);
          toast.success('Profile picture set automatically!', { autoClose: 2000 });
        }
      } catch (error: unknown) {
        console.error('Failed to auto-save PFP:', error);
        // Don't show error toast on auto-save failure - user can manually save
        // Only log it for debugging
      }
    };

    // Trigger auto-save when card is revealed
    if (selectedCardId && allImagesLoaded) {
      autoSavePFP();
    }
  }, [selectedCardId, allImagesLoaded, isAutoSaved, isSaving, baseSkinPath, traitPath]);

  const handleSavePFP = async () => {
    if (!selectedCardId) return;
    
    // Check if authentication token exists before proceeding
    if (!hasAuthToken()) {
      toast.error('Please ensure you are logged in and try again.');
      return;
    }
    
    setIsSaving(true);
    try {
      // Reuse existing composite file if available, otherwise create it
      let fileToSave = compositeFile;
      
      if (!fileToSave) {
        // Only regenerate if we don't have a stored file
        fileToSave = await compositeMascotImage(baseSkinPath, traitPath);
        setCompositeFile(fileToSave);
      }
      
      // Get user ID from localStorage with fallback
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found. Please ensure you are logged in and try again.');
      }

      // Upload and save the PFP
      const result = await pfpService.savePFP(fileToSave, userId);
      
      if (result.success) {
        setIsAutoSaved(true);
        // Show single professional success message
        toast.success('Profile picture updated successfully');
        if (onClose) {
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (error: unknown) {
      console.error('Failed to save PFP:', error);
      let message = 'Failed to save profile picture';
      if (error instanceof Error) {
        message = error.message || message;
      }
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center" ref={containerRef}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative"
      >
        {/* Composite Mascot Image */}
        <div className="relative w-[221px] h-[326px] mb-6 flex items-center justify-center">
          {!allImagesLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          
          {/* Base Skin Layer (background) */}
          <div className="absolute inset-0 z-10">
            <Image
              key={`base-${selectedCardId}`}
              src={baseSkinPath}
              alt="Base Skin"
              fill
              className="object-contain"
              priority
              unoptimized
              onLoad={() => setImagesLoaded(prev => ({ ...prev, base: true }))}
              onError={(e) => {
                console.error('Failed to load base skin:', baseSkinPath);
                e.currentTarget.style.display = 'none';
                setImagesLoaded(prev => ({ ...prev, base: true })); // Mark as loaded even on error to hide spinner
              }}
            />
          </div>
          
          {/* Stage Layer (middle) */}
          <div className="absolute inset-0 z-0">
            <Image
              key={`stage-${selectedCardId}`}
              src={stagePath}
              alt="Stage"
              fill
              className="object-contain"
              priority
              unoptimized
              onLoad={() => setImagesLoaded(prev => ({ ...prev, stage: true }))}
              onError={(e) => {
                console.error('Failed to load stage:', stagePath);
                e.currentTarget.style.display = 'none';
                setImagesLoaded(prev => ({ ...prev, stage: true })); // Mark as loaded even on error to hide spinner
              }}
            />
          </div>
          
          {/* Trait Layer (foreground) */}
          <div className="absolute inset-0 z-20">
            <Image
              key={`trait-${selectedCardId}-${traitPath}`}
              src={traitPath}
              alt={traitName}
              fill
              className="object-contain"
              priority
              unoptimized
              onLoad={() => setImagesLoaded(prev => ({ ...prev, trait: true }))}
              onError={(e) => {
                console.error('Failed to load trait:', traitPath);
                e.currentTarget.style.display = 'none';
                setImagesLoaded(prev => ({ ...prev, trait: true })); // Mark as loaded even on error to hide spinner
              }}
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
          {isAutoSaved ? (
            <div className="w-full text-center">
              <p className="text-sm text-green-400 mb-2">✓ Profile picture set!</p>
              <Button 
                onClick={handleSavePFP}
                disabled={isSaving}
                className="rounded-lg w-full border-[0.2px] border-[#FFFFFF20] font-medium text-[14px] text-[#FFFFFF50] disabled:opacity-50"
              >
                {isSaving ? 'Updating...' : 'Update Again'} <Save size={13} color="#FFFFFF50" />
              </Button>
            </div>
          ) : (
            <>
              <Button 
                className="cta-gradient w-26.5 rounded-lg font-medium text-[14px] text-white h-[36px]"
                disabled={isSaving}
              >
                {isSaving ? 'Setting...' : 'Set as Profile'}
              </Button>
              <Button 
                onClick={handleSavePFP}
                disabled={isSaving}
                className="rounded-lg w-26.5 border-[0.2px] border-[#FFFFFF20] font-medium text-[14px] text-[#FFFFFF50] disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'} <Save size={13} color="#FFFFFF50" />
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

