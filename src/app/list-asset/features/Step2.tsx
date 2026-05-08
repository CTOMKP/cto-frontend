"use client";

import React, { useState } from 'react'
import Image from 'next/image'
import { Globe, Upload } from 'lucide-react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface SocialLinks {
  website: string;
  twitter: string;
  telegram: string;
  discord: string;
}

interface Step2Props {
  profilePreview: string | null;
  bannerPreview: string | null;
  logoUrl?: string;
  bannerUrl?: string;
  logoUploading?: boolean;
  bannerUploading?: boolean;
  handleProfilePictureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCurrentStep: (step: number) => void;
  onContinue?: () => void | Promise<void>;
  onBioChange?: (bio: string) => void;
  /** Prefill when resuming a draft from profile (parent `bio` state on first mount). */
  initialBio?: string;
  links?: SocialLinks;
  setLinks?: (links: SocialLinks) => void;
}

export default function Step2({ 
  profilePreview, 
  bannerPreview, 
  logoUrl = '',
  bannerUrl = '',
  logoUploading = false,
  bannerUploading = false,
  handleProfilePictureChange, 
  handleBannerChange, 
  setCurrentStep,
  onContinue,
  onBioChange,
  initialBio = "",
  links,
  setLinks,
}: Step2Props) {
  const [bio, setBio] = useState(initialBio);
  const [continuing, setContinuing] = useState(false);
  const profileSrc = profilePreview || logoUrl;
  const bannerSrc = bannerPreview || bannerUrl;

  const handleContinue = async () => {
    if (onContinue) {
      setContinuing(true);
      try {
        await onContinue();
      } finally {
        setContinuing(false);
      }
    } else {
      setCurrentStep(3);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="profile-picture" className="font-medium">
          Upload Profile picture
          <span className="text-[#FF3939]">*</span>
        </label>
        <div className="flex flex-col mt-4">
          <span 
            className="size-[114px] bg-[#141414] flex items-center justify-center rounded-[3px] cursor-pointer border border-white/20 hover:border-white/40 transition-colors"
            onClick={() => !logoUploading && document.getElementById('profile-picture')?.click()}
          >
            {profileSrc ? (
              profileSrc.startsWith('http') ? (
                <img
                  src={profileSrc}
                  alt="preview"
                  className="w-full   h-full object-cover rounded-[3px]"
                />
              ) : (
                <Image
                  src={profileSrc}
                  alt="preview"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover rounded-[3px]"
                />
              )
            ) : (
              <div className="flex flex-col items-center gap-2 justify-center">
                <Upload size={16} color="#FFFFFF70" />
                <p className="text-[8px] font-light text-white/70 text-center">
                  Upload Square image
                  <br />
                  <span>(1:1, min 400x400px)</span>
                </p>
              </div>
            )}
          </span>

          <Input
            id="profile-picture"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePictureChange}
            disabled={logoUploading}
          />
          {logoUploading && (
            <span className="text-xs text-white/50 mt-2">Uploading...</span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="banner" className="font-medium">
          Banner
          <span className="text-[#FF3939]">*</span>
        </label>
        <ul className="mt-1.5 text-xs text-white/70 list-disc ml-4">
          <li>
            3:1 aspect ratio (rectangle, for example 600x200px or
            1500x500px)
          </li>
          <li>min. image width: 600px</li>
          <li>support formats: png, jpg, webp and gif</li>
          <li>max. file size: 4.5MB</li>
        </ul>

        <div className="flex flex-col mt-4">
          <span
            className="w-full h-[136px] border-[0.2px] border-white bg-[#141414] flex items-center justify-center rounded-[3px] cursor-pointer"
            style={{
              border: "1px solid transparent",
              background: `
                linear-gradient(#141414, #141414) padding-box,
                repeating-linear-gradient(45deg, gray 0, gray 10px, transparent 10px, transparent 20px) border-box
              `,
              borderRadius: "3px",
            }}
            onClick={() => !bannerUploading && document.getElementById('banner')?.click()}
          >
            {bannerSrc ? (
              bannerSrc.startsWith('http') ? (
                <img
                  src={bannerSrc}
                  alt="preview"
                  className="w-full h-full object-cover rounded-[3px]"
                />
              ) : (
                <Image
                  src={bannerSrc}
                  alt="preview"
                  width={400}
                  height={200}
                  className="w-full h-full object-cover rounded-[3px]"
                />
              )
            ) : (
              <div className="flex flex-col items-center gap-2 justify-center">
                <Upload size={20} color='#FFFFFF70' />
                <p className="text-center font-bold text-white/70">
                Drag & drop files or <span className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] bg-clip-text text-transparent">Browse</span>
                  <br />
                  <span className='text-sm font-normal'>
                  Supported formats JPEG,PNG
                  </span>
                </p>
              </div>
            )}
          </span>

          <Input
            id="banner"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerChange}
            disabled={bannerUploading}
          />
          {bannerUploading && (
            <span className="text-xs text-white/50 mt-2">Uploading...</span>
          )}
        </div>
      </div>

      <div>
      <label htmlFor="bio" className="font-medium">
          Bio
          <span className="text-[#FF3939]">*</span>
        </label>

        <Input 
          placeholder="Brief description..." 
          className="bg-white/5 border-[0.2px] h-12 mt-4 rounded-lg border-white/20"
          value={bio}
          onChange={(e) => {
            const value = e.target.value;
            setBio(value);
            if (onBioChange) {
              onBioChange(value);
            }
          }}
        />
      </div>

      <div>
        <label className="font-medium">
          Social media
        </label>
        <p className='text-xs text-white/70 mt-1.5 mb-4'>Submit your token contract and move to next step</p>
        
        <div className='grid grid-cols-2 gap-2 w-full'>
          <div className='relative flex justify-center items-center'>
          <Input
          value={links?.twitter}
          onChange={(e) => {
            const value = e.target.value;
            setLinks?.({ ...links, twitter: value } as SocialLinks);
          }} 
          placeholder='https://x.com/username' 
          className='flex items-center justify-center h-12 gap-2 rounded-lg border-[0.2px] border-white/20'
          />
          <Image loading="lazy" src="/x-white.svg" alt="twitter" width={16} height={16} className='absolute right-2' />
          </div>
          <div className='relative flex justify-center items-center'>
          <Input
          value={links?.telegram}
          onChange={(e) => {
            const value = e.target.value;
            setLinks?.({ ...links, telegram: value } as SocialLinks);
          }} 
          placeholder='https://t.me/username' 
          className='flex items-center justify-center h-12 gap-2 rounded-lg border-[0.2px] border-white/20'
          />
          <Image loading="lazy" src="/telegram.svg" alt="telegram" width={16} height={16} className='absolute right-2' />
          </div>
          <div className='relative flex justify-center items-center'>
          <Input
          value={links?.website}
          onChange={(e) => {
            const value = e.target.value;
            setLinks?.({ ...links, website: value } as SocialLinks);
          }} 
          placeholder='https://your-website.com' 
          className='flex items-center justify-center h-12 gap-2 rounded-lg border-[0.2px] border-white/20'
          />
          <Globe className='absolute right-2' size={16} color="#FFFFFF" />
          </div>
          <div className='relative flex justify-center items-center'>
          <Input
          value={links?.discord}
          onChange={(e) => {
            const value = e.target.value;
            setLinks?.({ ...links, discord: value } as SocialLinks);
          }} 
          placeholder='https://discord.com/invite/...' 
          className='flex items-center justify-center h-12 gap-2 rounded-lg border-[0.2px] border-white/20'
          />
          <Image className='absolute right-2' loading="lazy" src="/discord.svg" alt="twitter" width={16} height={16} />
          </div>
        </div>
      </div>

      {/* <div>
        <label className="font-medium">
        Additional links(<span className='text-white/50'>Optional</span>)
        </label>
        
        <span className='flex items-center justify-center max-w-60 h-12 gap-2 rounded-lg border-[0.2px] border-white/20 mt-4'>
            <Plus size={16} color='#FFFFFF' />
            <p className='text-white/50'>Add a link</p>
          </span>
      </div> */}

      <Button
        onClick={handleContinue}
        disabled={continuing}
        className="font-medium w-full gap-2 bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] rounded-lg h-9 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {continuing ? 'Saving...' : 'Continue'}
      </Button>
    </div>
  );
}
