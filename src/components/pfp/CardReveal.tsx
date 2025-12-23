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

interface CardRevealProps {
  onClose?: () => void;
}

// Mascot traits matching actual images
type TraitType = 
  | 'ARTIST' | 'ARTIST2' | 'ARTIST3'
  | 'CTO' | 'CTO2'
  | 'DEGEN' | 'DEGEN2'
  | 'DEV'
  | 'EARLYADT.WHALE'
  | 'HACKER' | 'HACKER2' | 'HACKER3'
  | 'HODLER'
  | 'KOL'
  | 'MOD' | 'MOD2' | 'MOD3'
  | 'NEWBIE'
  | 'SHILLER'
  | 'VISIONARY' | 'VISIONARY2'
  | 'WHALE' | 'WHALE2' | 'WHALE3';

type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

// Trait metadata
const TRAIT_INFO: Record<TraitType, { name: string; rarity: Rarity; description: string }> = {
  'NEWBIE': { name: 'Newbie', rarity: 'Common', description: 'Just getting started in crypto' },
  'HODLER': { name: 'Hodler', rarity: 'Common', description: 'Diamond hands forever' },
  'SHILLER': { name: 'Shiller', rarity: 'Common', description: 'Always promoting the next big thing' },
  'DEV': { name: 'Developer', rarity: 'Uncommon', description: 'Building the future of Web3' },
  'ARTIST': { name: 'Artist', rarity: 'Uncommon', description: 'Creating beautiful NFTs' },
  'ARTIST2': { name: 'Artist II', rarity: 'Rare', description: 'Master of digital art' },
  'ARTIST3': { name: 'Artist III', rarity: 'Epic', description: 'Legendary NFT creator' },
  'MOD': { name: 'Moderator', rarity: 'Uncommon', description: 'Keeping the community safe' },
  'MOD2': { name: 'Moderator II', rarity: 'Rare', description: 'Trusted community guardian' },
  'MOD3': { name: 'Moderator III', rarity: 'Epic', description: 'Elite community leader' },
  'DEGEN': { name: 'Degen', rarity: 'Rare', description: 'Risk-taking crypto enthusiast' },
  'DEGEN2': { name: 'Degen II', rarity: 'Epic', description: 'Master of high-risk plays' },
  'KOL': { name: 'KOL', rarity: 'Rare', description: 'Key Opinion Leader in crypto' },
  'HACKER': { name: 'Hacker', rarity: 'Rare', description: 'Security expert and builder' },
  'HACKER2': { name: 'Hacker II', rarity: 'Epic', description: 'Elite smart contract auditor' },
  'HACKER3': { name: 'Hacker III', rarity: 'Legendary', description: 'Legendary blockchain architect' },
  'CTO': { name: 'CTO', rarity: 'Epic', description: 'Chief Technology Officer' },
  'CTO2': { name: 'CTO II', rarity: 'Legendary', description: 'Visionary tech leader' },
  'VISIONARY': { name: 'Visionary', rarity: 'Epic', description: 'Sees the future of crypto' },
  'VISIONARY2': { name: 'Visionary II', rarity: 'Legendary', description: 'Legendary crypto prophet' },
  'WHALE': { name: 'Whale', rarity: 'Epic', description: 'Major market player' },
  'WHALE2': { name: 'Whale II', rarity: 'Legendary', description: 'Legendary whale with massive holdings' },
  'WHALE3': { name: 'Whale III', rarity: 'Legendary', description: 'Mythical market mover' },
  'EARLYADT.WHALE': { name: 'Early Adopter Whale', rarity: 'Legendary', description: 'OG crypto whale' },
};

interface MascotCard {
  id: string;
  trait: TraitType;
  name: string;
  rarity: Rarity;
  description: string;
  compositeImage: string; // Data URL of the layered image
}

// Generate composite image from layers (like test frontend)
const createCompositeImage = async (traitType: TraitType): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject('Canvas not supported');
      return;
    }

    // Set canvas size
    canvas.width = 800;
    canvas.height = 800;

    const images = {
      stage: document.createElement('img'),
      baseSkin: document.createElement('img'),
      trait: document.createElement('img'),
    };

    let loadedCount = 0;
    const totalImages = 3;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        // Draw layers in order: stage -> base skin -> trait
        ctx.drawImage(images.stage, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(images.baseSkin, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(images.trait, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL('image/png'));
      }
    };

    const onImageError = (src: string) => {
      console.error('Failed to load mascot image:', src);
      reject(`Failed to load mascot image: ${src}`);
    };

    // Load all images from CloudFront CDN (S3)
    // Fallback to local paths for development if CloudFront is not configured
    const stagePath = getMascotImageUrl('mascots/STAGE/STAGE.png');
    const baseSkinPath = getMascotImageUrl('mascots/SKIN/BASE SKIN.png');
    const traitPath = getMascotImageUrl(`mascots/TRAITS/${traitType}.png`);

    // Set crossOrigin for CORS when loading from CloudFront (cross-origin)
    // This prevents "tainted canvas" errors when calling toDataURL()
    const isCloudFrontUrl = stagePath.startsWith('http');
    if (isCloudFrontUrl) {
      images.stage.crossOrigin = 'anonymous';
      images.baseSkin.crossOrigin = 'anonymous';
      images.trait.crossOrigin = 'anonymous';
    }

    images.stage.onload = onImageLoad;
    images.stage.onerror = () => onImageError(stagePath);
    images.stage.src = stagePath;

    images.baseSkin.onload = onImageLoad;
    images.baseSkin.onerror = () => onImageError(baseSkinPath);
    images.baseSkin.src = baseSkinPath;

    images.trait.onload = onImageLoad;
    images.trait.onerror = () => onImageError(traitPath);
    images.trait.src = traitPath;
  });
};


export const CardReveal: React.FC<CardRevealProps> = ({ onClose }) => {
  const { user } = usePrivy();
  const [isRevealing, setIsRevealing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [mascotCard, setMascotCard] = useState<MascotCard | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaved, setIsAutoSaved] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({ base: false, stage: false, trait: false });
  const [compositeFile, setCompositeFile] = useState<File | null>(null);
  const { user } = usePrivy();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const allImagesLoaded = imagesLoaded.base && imagesLoaded.stage && imagesLoaded.trait;

  // Generate mascot based on wallet address + timestamp + random (like test frontend)
  const generateMascot = async (): Promise<MascotCard> => {
    // Get wallet address from user or localStorage (matching test frontend logic)
    // Test frontend uses: wallet?.address || user?.email || 'demo'
    interface PrivyLinkedAccount {
      type: string;
      address?: string;
    }
    const walletAddress = 
      (user?.linkedAccounts as PrivyLinkedAccount[] | undefined)?.find((acc) => acc.type === 'wallet')?.address ||
      (typeof window !== 'undefined' ? localStorage.getItem('cto_wallet_address') : null) ||
      user?.email?.address || 
      user?.id || 
      'demo';
    
    const timestamp = Date.now();
    const random = Math.random() * 1000000;
    const seed = `${walletAddress}_${timestamp}_${random}`;
    const seedHash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

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
          console.log('✅ PFP auto-saved successfully:', result.imageUrl);
          // No toast for auto-save - user will see it when they manually save or it will be silent
        }
      } catch (error) {
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
    <div className="flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative"
      >
        {/* Card Back (Before Reveal) */}
        {!isRevealed && (
          <div className="w-[221px] h-[326px] rounded-xl border-4 border-pink-500 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎴</div>
              <div className="text-white text-xl font-bold">Mystery Card</div>
              <div className="text-gray-400 text-sm">
                {isRevealing ? 'Revealing your mascot...' : 'Click to reveal your mascot!'}
              </div>
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

        {/* Card Front (After Reveal) */}
        {isRevealed && mascotCard && (
          <div className="w-[221px] rounded-xl border-4 border-pink-500 bg-gradient-to-br from-gray-800 to-gray-900 p-4 transform transition-all duration-1000 overflow-hidden mb-6">
            {/* Rarity Badge */}
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-2 ${
              mascotCard.rarity === 'Common' ? 'bg-gray-500 text-white' :
              mascotCard.rarity === 'Uncommon' ? 'bg-green-500 text-white' :
              mascotCard.rarity === 'Rare' ? 'bg-blue-500 text-white' :
              mascotCard.rarity === 'Epic' ? 'bg-purple-500 text-white' :
              'bg-yellow-500 text-black'
            }`}>
              ✨ {mascotCard.rarity}
            </div>

            {/* Mascot Composite Image */}
            <div className="text-center mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={mascotCard.compositeImage} 
                alt={mascotCard.name}
                className="w-full h-auto rounded-lg mb-2"
              />
              <div className="text-white font-bold text-xl">{mascotCard.name}</div>
            </div>

            {/* Description */}
            <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
              <p className="text-gray-300 text-sm text-center italic">
                &quot;{mascotCard.description}&quot;
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isRevealed && (
          <div className="text-center mt-4">
            <Button
              onClick={handleReveal}
              disabled={isRevealing}
              className="cta-gradient w-full rounded-lg font-medium text-[14px] text-white h-[36px] disabled:opacity-50"
            >
              {isRevealing ? '🎴 Revealing...' : '🎴 Reveal Your Mascot!'}
            </Button>
          </div>
        )}

        {isRevealed && mascotCard && (
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
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
