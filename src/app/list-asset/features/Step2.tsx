"use client";

import React, { useState } from 'react'
import Image from 'next/image'
import { Globe, Plus, Upload } from 'lucide-react'
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
  handleProfilePictureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCurrentStep: (step: number) => void;
  onBioChange?: (bio: string) => void;
  links?: SocialLinks;
  setLinks?: (links: SocialLinks) => void;
}

export default function Step2({ 
  profilePreview, 
  bannerPreview, 
  handleProfilePictureChange, 
  handleBannerChange, 
  setCurrentStep,
  onBioChange,
  links,
  setLinks,
}: Step2Props) {
  const [bio, setBio] = useState('');
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="profile-picture" className="font-medium">
          Upload Profile picture
          <span className="text-[#FF3939]">*</span>
        </label>
        <div className="flex flex-col mt-4">
          <span 
            className="size-[114px] bg-[#141414] flex items-center justify-center rounded-[3px] cursor-pointer"
            onClick={() => document.getElementById('profile-picture')?.click()}
          >
            {profilePreview ? (
              <Image
                src={profilePreview}
                alt="preview"
                width={200}
                height={200}
                className="w-full h-full object-cover rounded-[3px]"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 justify-center">
                <Image
                  src="/document-upload.svg"
                  width={16}
                  height={16}
                  alt="document-upload"
                />
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
          />
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
            onClick={() => document.getElementById('banner')?.click()}
          >
            {bannerPreview ? (
              <Image
                src={bannerPreview}
                alt="preview"
                width={400}
                height={200}
                className="w-full h-full object-cover rounded-[3px]"
              />
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
          />
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
        <label htmlFor="twitter" className="font-medium">
          Twitter Link
        </label>
        <div className="flex flex-col mt-4">
          <span className="w-full h-[136px] border-[0.2px] border-white bg-[#141414] flex items-center justify-center rounded-[3px] cursor-pointer">
            <Input
              id="twitter"
              placeholder="https://twitter.com/username"
              className="hidden"
              value={links?.twitter}
              onChange={(e) => {
                const value = e.target.value;
                setLinks?.({ ...links, twitter: value } as SocialLinks);
              }}
            />
          </span>
          <p className="text-[8px] font-light text-white/70 text-center">
            Add your X handle
          </p>
        </div>

        <label htmlFor="telegram" className="font-medium">
          Telegram Link
        </label>
        <div className="flex flex-col mt-4">
          <span className="w-full h-[136px] border-[0.2px] border-white bg-[#141414] flex items-center justify-center rounded-[3px] cursor-pointer">
            <Input
              id="telegram"
              placeholder="https://t.me/username"
              className="hidden"
              value={links?.telegram}
              onChange={(e) => {
                const value = e.target.value;
                setLinks?.({ ...links, telegram: value } as SocialLinks);
              }}
            />
          </span>
          <p className="text-[8px] font-light text-white/70 text-center">
            Add your Telegram username
          </p>
        </div>

        <label htmlFor="discord" className="font-medium">
          Discord Link
        </label>
        <div className="flex flex-col mt-4">
          <span className="w-full h-[136px] border-[0.2px] border-white bg-[#141414] flex items-center justify-center rounded-[3px] cursor-pointer">
            <Input
              id="discord"
              placeholder="https://discord.com/invite/..."
              className="hidden"
              value={links?.discord}
              onChange={(e) => {
                const value = e.target.value;
                setLinks?.({ ...links, discord: value } as SocialLinks);
              }}
            />
          </span>
          <p className="text-[8px] font-light text-white/70 text-center">
            Add your Discord server invite
          </p>
        </div>

        <label htmlFor="website" className="font-medium">
          Website Link
        </label>
        <div className="flex flex-col mt-4">
          <span className="w-full h-[136px] border-[0.2px] border-white bg-[#141414] flex items-center justify-center rounded-[3px] cursor-pointer">
            <Input
              id="website"
              placeholder="https://your-website.com"
              className="hidden"
              value={links?.website}
              onChange={(e) => {
                const value = e.target.value;
                setLinks?.({ ...links, website: value } as SocialLinks);
              }}
            />
          </span>
          <p className="text-[8px] font-light text-white/70 text-center">
            Add your website URL
          </p>
        </div>
      </div>

      <div>
        <label className="font-medium">
          Social media
        </label>
        <p className='text-xs text-white/70 mt-1.5 mb-4'>Submit your token contract and move to next step</p>
        
        <div className='grid grid-cols-2 gap-2 w-full'>
          <span className='flex items-center justify-center h-12 gap-2 rounded-lg border-[0.2px] border-white/20'>
            <Image loading="lazy" src="/x-white.svg" alt="twitter" width={16} height={16} />
            <p className='text-white/50'>Link X</p>
          </span>
          <span className='flex items-center justify-center h-12 gap-2 rounded-lg border-[0.2px] border-white/20'>
            <Image loading="lazy" src="/telegram.svg" alt="twitter" width={16} height={16} />
            <p className='text-white/50'>Link Telegram</p>
          </span>
          <span className='flex items-center justify-center h-12 gap-2 rounded-lg border-[0.2px] border-white/20'>
            <Globe size={16} color="#FFFFFF" />
            <p className='text-white/50'>Link website</p>
            
          </span>
          <span className='flex items-center justify-center h-12 gap-2 rounded-lg border-[0.2px] border-white/20'>
            <Image loading="lazy" src="/discord.svg" alt="twitter" width={16} height={16} />
            <p className='text-white/50'>Link Discord</p>
          </span>
        </div>
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
        onClick={() => setCurrentStep(3)}
        className="font-medium w-full gap-2 bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] rounded-lg h-9"
      >
        Continue
      </Button>
    </div>
  );
}
