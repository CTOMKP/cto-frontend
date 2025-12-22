"use client";

import React, { useState, useEffect } from 'react';
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

    // All available traits
    const allTraits: TraitType[] = Object.keys(TRAIT_INFO) as TraitType[];
    
    // Select trait based on weighted rarity
    const rarityRoll = Math.abs(seedHash) % 100;
    let targetRarity: Rarity;
    if (rarityRoll < 40) targetRarity = 'Common'; // 40%
    else if (rarityRoll < 65) targetRarity = 'Uncommon'; // 25%
    else if (rarityRoll < 82) targetRarity = 'Rare'; // 17%
    else if (rarityRoll < 94) targetRarity = 'Epic'; // 12%
    else targetRarity = 'Legendary'; // 6%

    // Filter traits by rarity
    const traitsOfRarity = allTraits.filter(t => TRAIT_INFO[t].rarity === targetRarity);
    const selectedTrait = traitsOfRarity[Math.abs(seedHash >> 2) % traitsOfRarity.length];
    
    const traitInfo = TRAIT_INFO[selectedTrait];
    
    // Generate composite image
    const compositeImage = await createCompositeImage(selectedTrait);

    return {
      id: `mascot_${Date.now()}`,
      trait: selectedTrait,
      name: traitInfo.name,
      rarity: traitInfo.rarity,
      description: traitInfo.description,
      compositeImage,
    };
  };

  // Handle reveal button click (like test frontend)
  const handleReveal = async () => {
    if (isRevealed || isRevealing) return;
    
    setIsRevealing(true);
    try {
      const mascot = await generateMascot();
      setMascotCard(mascot);
      
      // Animation delay
      setTimeout(() => {
        setIsRevealed(true);
        setIsRevealing(false);
        toast.success(`🎉 You got a ${mascot.rarity} ${mascot.name}!`);
      }, 2000);
    } catch (error) {
      console.error('Failed to generate mascot:', error);
      toast.error('Failed to generate mascot. Please try again.');
      setIsRevealing(false);
    }
  };

  // Get user ID from localStorage (matching test frontend exactly)
  // The test frontend assumes cto_user_id is already stored from initial auth sync
  const getUserId = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cto_user_id');
    }
    return null;
  };

  // Auto-save PFP when mascot is revealed (like test frontend)
  useEffect(() => {
    const handleSavePFP = async () => {
      if (!mascotCard || !isRevealed || isAutoSaved || isSaving) return;

      try {
        // Convert data URL to File
        const dataUrl = mascotCard.compositeImage;
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `mascot-${mascotCard.id}.png`, { type: 'image/png' });

        // Get user ID from localStorage (matching test frontend: localStorage.getItem('cto_user_id'))
        const userId = getUserId();

        if (!userId) {
          console.warn('User ID not found, skipping auto-save. Please ensure you are logged in.');
          // Don't show error toast - just log it, as the user can still use the mascot
          return;
        }

        // Save PFP automatically (silent - no toast)
        const result = await pfpService.savePFP(file, userId);
        
        if (result.success) {
          setIsAutoSaved(true);
          console.log('✅ PFP auto-saved successfully:', result.imageUrl);
          // No toast for auto-save - user will see it when they manually save or it will be silent
        }
      } catch (error) {
        console.error('Failed to auto-save PFP:', error);
        // Don't show error toast - just log it, as the user can still use the mascot
      }
    };

    // Trigger auto-save when mascot is revealed
    if (isRevealed && mascotCard) {
      handleSavePFP();
    }
  }, [mascotCard, isRevealed, isAutoSaved, isSaving]);

  const handleSavePFP = async () => {
    if (!mascotCard) return;
    
    setIsSaving(true);
    try {
      // Convert data URL to File
      const dataUrl = mascotCard.compositeImage;
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `mascot-${mascotCard.id}.png`, { type: 'image/png' });

      // Get user ID from localStorage (matching test frontend: localStorage.getItem('cto_user_id'))
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found. Please ensure you are logged in and try again.');
      }

      // Upload and save the PFP
      const result = await pfpService.savePFP(file, userId);
      
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
          </div>
        )}

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

  };


  // Get user ID from localStorage (matching test frontend exactly)
  // The test frontend assumes cto_user_id is already stored from initial auth sync
  const getUserId = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cto_user_id');
    }
    return null;
  };


  // Auto-save PFP when mascot is revealed (like test frontend)

  useEffect(() => {

    const handleSavePFP = async () => {

      if (!mascotCard || !isRevealed || isAutoSaved || isSaving) return;



      try {

        // Convert data URL to File

        const dataUrl = mascotCard.compositeImage;

        const response = await fetch(dataUrl);

        const blob = await response.blob();

        const file = new File([blob], `mascot-${mascotCard.id}.png`, { type: 'image/png' });



        // Get user ID from localStorage (matching test frontend: localStorage.getItem('cto_user_id'))
        const userId = getUserId();


        if (!userId) {

          console.warn('User ID not found, skipping auto-save. Please ensure you are logged in.');
          // Don't show error toast - just log it, as the user can still use the mascot
          return;

        }



        // Save PFP automatically

        const result = await pfpService.savePFP(file, userId);

        

        if (result.success) {

          setIsAutoSaved(true);

          console.log('✅ PFP auto-saved successfully:', result.imageUrl);

          toast.success('🎉 Profile picture saved automatically!');

        }

      } catch (error) {

        console.error('Failed to auto-save PFP:', error);

        // Don't show error toast - just log it, as the user can still use the mascot

      }

    };



    // Trigger auto-save when mascot is revealed

    if (isRevealed && mascotCard) {

      handleSavePFP();

    }

  }, [mascotCard, isRevealed, isAutoSaved, isSaving]);


  const handleSavePFP = async () => {

    if (!mascotCard) return;

    

    setIsSaving(true);

    try {

      // Convert data URL to File

      const dataUrl = mascotCard.compositeImage;

      const response = await fetch(dataUrl);

      const blob = await response.blob();

      const file = new File([blob], `mascot-${mascotCard.id}.png`, { type: 'image/png' });



      // Get user ID from localStorage (matching test frontend: localStorage.getItem('cto_user_id'))
      const userId = getUserId();
      if (!userId) {

        throw new Error('User ID not found. Please ensure you are logged in and try again.');
      }



      // Upload and save the PFP

      const result = await pfpService.savePFP(file, userId);

      

      if (result.success) {

        setIsAutoSaved(true);

        toast.success(result.message || 'Profile picture saved successfully!');

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

          </div>

        )}



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




  };


  // Get user ID from localStorage (matching test frontend exactly)
  // The test frontend assumes cto_user_id is already stored from initial auth sync
  const getUserId = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cto_user_id');
    }
    return null;
  };


  // Auto-save PFP when mascot is revealed (like test frontend)

  useEffect(() => {

    const handleSavePFP = async () => {

      if (!mascotCard || !isRevealed || isAutoSaved || isSaving) return;



      try {

        // Convert data URL to File

        const dataUrl = mascotCard.compositeImage;

        const response = await fetch(dataUrl);

        const blob = await response.blob();

        const file = new File([blob], `mascot-${mascotCard.id}.png`, { type: 'image/png' });



        // Get user ID from localStorage (matching test frontend: localStorage.getItem('cto_user_id'))
        const userId = getUserId();


        if (!userId) {

          console.warn('User ID not found, skipping auto-save. Please ensure you are logged in.');
          // Don't show error toast - just log it, as the user can still use the mascot
          return;

        }



        // Save PFP automatically

        const result = await pfpService.savePFP(file, userId);

        

        if (result.success) {

          setIsAutoSaved(true);

          console.log('✅ PFP auto-saved successfully:', result.imageUrl);

          toast.success('🎉 Profile picture saved automatically!');

        }

      } catch (error) {

        console.error('Failed to auto-save PFP:', error);

        // Don't show error toast - just log it, as the user can still use the mascot

      }

    };



    // Trigger auto-save when mascot is revealed

    if (isRevealed && mascotCard) {

      handleSavePFP();

    }

  }, [mascotCard, isRevealed, isAutoSaved, isSaving]);


  const handleSavePFP = async () => {

    if (!mascotCard) return;

    

    setIsSaving(true);

    try {

      // Convert data URL to File

      const dataUrl = mascotCard.compositeImage;

      const response = await fetch(dataUrl);

      const blob = await response.blob();

      const file = new File([blob], `mascot-${mascotCard.id}.png`, { type: 'image/png' });



      // Get user ID from localStorage (matching test frontend: localStorage.getItem('cto_user_id'))
      const userId = getUserId();
      if (!userId) {

        throw new Error('User ID not found. Please ensure you are logged in and try again.');
      }



      // Upload and save the PFP

      const result = await pfpService.savePFP(file, userId);

      

      if (result.success) {

        setIsAutoSaved(true);

        toast.success(result.message || 'Profile picture saved successfully!');

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

          </div>

        )}



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

