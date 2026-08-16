"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { pfpService } from '@/services/pfpService';
import { toast } from 'react-toastify';
import { usePrivy } from '@privy-io/react-auth';
import { getMascotImageUrl } from '@/lib/image-url-helper';
import { getAuthToken } from '@/lib/authSession';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/lib/sessionStore';

interface CardRevealProps {
  selectedCardId: number | null;
  mascotTrait: string;
  onClose?: () => void;
  onImageSaved?: (imageUrl: string) => void;
}

/**
 * Composite mascot layers into a single canvas image (without stage layer)
 * Uses high resolution (800x800) for better quality, scales down from display size
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

    // Set canvas size to high resolution (800x800) for better quality
    canvas.width = 800;
    canvas.height = 800;

    const baseSkinImg = document.createElement('img');
    const traitImg = document.createElement('img');
    let loadedCount = 0;
    const totalImages = 2;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw layers in order: base skin (background), trait (foreground)
        ctx.drawImage(baseSkinImg, 0, 0, canvas.width, canvas.height); // Base skin
        ctx.drawImage(traitImg, 0, 0, canvas.width, canvas.height); // Trait

        // Convert canvas to blob, then to File
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'));
            return;
          }
          const file = new File([blob], `mascot-pfp-${Date.now()}.png`, { type: 'image/png' });
          resolve(file);
        }, 'image/png');
      }
    };

    // Check if URLs are CloudFront (cross-origin) and set crossOrigin accordingly
    const isCloudFrontUrl = baseSkinPath.startsWith('http');
    if (isCloudFrontUrl) {
      baseSkinImg.crossOrigin = 'anonymous';
      traitImg.crossOrigin = 'anonymous';
    }

    baseSkinImg.onload = onImageLoad;
    baseSkinImg.onerror = () => reject(new Error(`Failed to load base skin: ${baseSkinPath}`));
    baseSkinImg.src = baseSkinPath;

    traitImg.onload = onImageLoad;
    traitImg.onerror = () => reject(new Error(`Failed to load trait: ${traitPath}`));
    traitImg.src = traitPath;
  });
};

export const CardReveal: React.FC<CardRevealProps> = ({ selectedCardId, mascotTrait, onImageSaved }) => {
  const sessionUserId = useSessionStore((s) => s.userId);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaved, setIsAutoSaved] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({ base: false, stage: false, trait: false });
  const [compositeFile, setCompositeFile] = useState<File | null>(null);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);
  const { user } = usePrivy();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const traitName = mascotTrait;
  // Use CloudFront CDN URLs for better performance
  const baseSkinPath = getMascotImageUrl('mascots/SKIN/BASE SKIN.png');
  const stagePath = getMascotImageUrl('mascots/STAGE/STAGE.png');
  const traitPath = getMascotImageUrl(`mascots/TRAITS/${mascotTrait}.png`);

  // Track if all images are loaded
  const allImagesLoaded = imagesLoaded.base && imagesLoaded.stage && imagesLoaded.trait;

  const resolveUserId = useCallback((): string | null => {
    if (sessionUserId) return sessionUserId;
    return user?.id ?? null;
  }, [sessionUserId, user?.id]);

  // Check if authentication token exists (memoized for useEffect dependency)
  const hasAuthToken = useCallback((): boolean => {
    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      return !!token;
    }
    return false;
  }, []);

  // Memoize compositeMascotImage function to avoid recreating on each render
  const compositeMascotImageMemo = useCallback(
    (baseSkinPath: string, traitPath: string) => compositeMascotImage(baseSkinPath, traitPath),
    []
  );

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
  }, [selectedCardId, mascotTrait]);

  // Auto-save when images are loaded (card is revealed) - waits for all images to load
  useEffect(() => {
    const autoSavePFP = async () => {
      if (!selectedCardId || !allImagesLoaded || isAutoSaved || isSaving) return;

      toast.info('Your profile picture is automatically updating, Please wait', { autoClose: 3000 });

      try {
        // Check if authentication token exists before proceeding
        if (!hasAuthToken()) {
          console.warn('Authentication token not found, skipping auto-save. Please ensure you are logged in.');
          return;
        }

        // Composite the mascot layers into a single image file (without stage)
        const file = await compositeMascotImageMemo(baseSkinPath, traitPath);
        setCompositeFile(file); // Store for reuse in manual save

        // Get user ID from localStorage only
        const resolvedUserId = resolveUserId() ?? undefined;
        if (!resolvedUserId) {
          console.warn('User ID not found, skipping auto-save. Please ensure you are logged in.');
          return;
        }

        // Upload and save the PFP automatically (silently, without setting isSaving)
        const result = await pfpService.savePFP(file, resolvedUserId);

        if (result.success) {
          setIsAutoSaved(true);
          setSavedImageUrl(result.imageUrl || null);
          console.log('✅ PFP auto-saved successfully:', result.imageUrl);
          toast.success('Profile picture set automatically!', { autoClose: 2000 });
          if (onImageSaved && result.imageUrl) {
            onImageSaved(result.imageUrl);
          }
        }
      } catch (error: unknown) {
        console.error('Failed to auto-save PFP:', error);
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to auto-save profile picture. You can save manually.';
        toast.error(message, { autoClose: 5000 });
        // Keep isAutoSaved false so Set as Profile / Save stay available
      }
    };

    // Trigger auto-save when card is revealed and all images are loaded
    if (selectedCardId && allImagesLoaded) {
      autoSavePFP();
    }
  }, [selectedCardId, allImagesLoaded, isAutoSaved, isSaving, baseSkinPath, traitPath, compositeMascotImageMemo, resolveUserId, hasAuthToken]);

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
        fileToSave = await compositeMascotImageMemo(baseSkinPath, traitPath);
        setCompositeFile(fileToSave);
      }

      // Get user ID from localStorage only
      const userId = resolveUserId() ?? undefined;
      if (!userId) {
        throw new Error('User ID not found. Please ensure you are logged in and try again.');
      }

      // Upload and save the PFP
      const result = await pfpService.savePFP(fileToSave, userId);

      if (result.success) {
        setIsAutoSaved(true);
        setSavedImageUrl(result.imageUrl || null);
        toast.success('Profile picture updated successfully');
        if (onImageSaved && result.imageUrl) {
          onImageSaved(result.imageUrl);
        }
        // Don't close dialog - user can still share on social media or copy link
        // if (onClose) {
        //   setTimeout(() => onClose(), 1000);
        // }
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
        <div className="relative w-[221px] mx-auto h-[326px] mb-6 flex items-center justify-center">
          {/* Base Skin Layer (background) */}
          <div className="absolute inset-0 z-10 pointer-events-none">
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
          <div className="absolute inset-0 z-0 pointer-events-none">
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
          <div className="absolute inset-0 z-20 pointer-events-none">
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
        <div className="flex flex-col gap-2 mb-2 w-full">
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
              <Button 
                onClick={() => {
                  router.push('/profile');
                }}
                className="cta-gradient rounded-lg w-full font-medium text-[14px] text-white mt-2"
              >
                Go to Profile
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <Button 
                onClick={handleSavePFP}
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
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
