"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Plus } from 'lucide-react';

export interface ProjectDetailsData {
  category?: string;
  subcategory?: string;
  projectName?: string;
  adTitle?: string;
  projectDescription?: string;
  blockchainFocus?: string;
  blockchainOther?: string;
  roleType?: string;
  toolsStack?: string;
  paymentType?: string;
  amount?: string;
  deadline?: string;
  noFixedDeadline?: boolean;
  visibility?: string;
  boostOptions?: Record<string, boolean>;
  /** Up to 3 image files for the ad (same as cto-test-frontend). */
  images?: (File | null)[];
  /** Preview object URLs for display (from URL.createObjectURL). */
  imagePreviews?: string[];
}

interface ProjectDetailsStepProps {
  onNext: (data: ProjectDetailsData) => void;
  onBack: () => void;
  initialData?: ProjectDetailsData;
}

const categoryIdToName: Record<string, string> = {
  'developers': 'Developers',
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

const AD_TITLE_MIN = 6;
const AD_TITLE_MAX = 80;
const DESC_MIN = 800;

function getDescriptionCounterText(length: number): { line: string; tone: 'muted' | 'warn' | 'ok' | 'error' } {
  if (length < DESC_MIN) {
    return {
      line: `${length} entered · ${DESC_MIN - length} more required (${DESC_MIN} minimum)`,
      tone: 'warn',
    };
  }
  return {
    line: `${length} entered · minimum met (${length - DESC_MIN} over minimum)`,
    tone: 'ok',
  };
}

function getAdTitleCounterText(length: number): { line: string; tone: 'muted' | 'warn' | 'ok' | 'error' } {
  if (length === 0) {
    return { line: `0/${AD_TITLE_MAX} · ${AD_TITLE_MIN}-${AD_TITLE_MAX} characters required`, tone: 'muted' };
  }
  if (length < AD_TITLE_MIN) {
    return {
      line: `${length}/${AD_TITLE_MAX} · ${AD_TITLE_MIN - length} more required`,
      tone: 'warn',
    };
  }
  if (length > AD_TITLE_MAX) {
    return {
      line: `${length}/${AD_TITLE_MAX} · ${length - AD_TITLE_MAX} over limit`,
      tone: 'error',
    };
  }
  return { line: `${length}/${AD_TITLE_MAX} · ${AD_TITLE_MAX - length} remaining`, tone: 'ok' };
}

function getCategoryDisplayName(id: string | undefined): string {
  if (!id) return '—';
  return categoryIdToName[id] ?? id;
}

/** Today in YYYY-MM-DD for date input min (only allow future dates). */
function getTodayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Normalize various date strings to YYYY-MM-DD for input[type="date"]. */
function toDateValue(str: string | undefined): string {
  if (!str || !str.trim()) return '';
  const s = str.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const mmddyyyy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    const [, mm, dd, yyyy] = mmddyyyy;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
}

export default function ProjectDetailsStep({ onNext, onBack, initialData }: ProjectDetailsStepProps) {
  const [projectName, setProjectName] = useState(initialData?.projectName || '');
  const [adTitle, setAdTitle] = useState(initialData?.adTitle || '');
  const [projectDescription, setProjectDescription] = useState(initialData?.projectDescription || '');
  const [blockchainFocus, setBlockchainFocus] = useState(initialData?.blockchainFocus || 'Solana');
  const [blockchainOther, setBlockchainOther] = useState(initialData?.blockchainOther || '');
  const roleType = initialData?.subcategory || initialData?.roleType || '';
  const [toolsStack, setToolsStack] = useState(initialData?.toolsStack || '');
  const [paymentType, setPaymentType] = useState(initialData?.paymentType || 'USDT');
  const [amount, setAmount] = useState(initialData?.amount || '10,000');
  const [deadline, setDeadline] = useState(() => toDateValue(initialData?.deadline || ''));
  const minDate = getTodayLocal();
  const [noFixedDeadline, setNoFixedDeadline] = useState(initialData?.noFixedDeadline || false);
  const [visibility, setVisibility] = useState(initialData?.visibility ?? '');
  const [boostOptions, setBoostOptions] = useState<Record<string, boolean>>(initialData?.boostOptions || {});
  const MAX_IMAGES = 3;
  const [images, setImages] = useState<(File | null)[]>(() => {
    const from = initialData?.images ?? [];
    const padded = [...from];
    while (padded.length < MAX_IMAGES) padded.push(null);
    return padded.slice(0, MAX_IMAGES);
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>(() => {
    const from = initialData?.imagePreviews ?? [];
    const padded = [...from];
    while (padded.length < MAX_IMAGES) padded.push('');
    return padded.slice(0, MAX_IMAGES);
  });
  const fileInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const projectNameRef = React.useRef<HTMLDivElement | null>(null);
  const adTitleRef = React.useRef<HTMLDivElement | null>(null);
  const imagesRef = React.useRef<HTMLDivElement | null>(null);
  const projectDescriptionRef = React.useRef<HTMLDivElement | null>(null);
  const specsRef = React.useRef<HTMLDivElement | null>(null);

  const [errors, setErrors] = useState<{
    projectName?: string;
    adTitle?: string;
    images?: string;
    projectDescription?: string;
    blockchainOther?: string;
  }>({});

  const handleBoostToggle = (option: string) => {
    setBoostOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleImageChange = (index: number, file: File | null) => {
    setImages(prev => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    setImagePreviews(prev => {
      const next = [...prev];
      if (file) {
        next[index] = URL.createObjectURL(file);
      } else {
        next[index] = '';
      }
      return next;
    });
  };

  const triggerFileInput = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const calculateSubtotal = () => {
    let total = 0;
    // Category fee (chosen in step 1) - same as PreviewStep
    if (initialData?.category && initialData?.subcategory) {
      total += 5;
    }
    if (visibility === 'plus') total += 5;
    if (visibility === 'premium') total += 15;
    if (boostOptions['auto-bump']) total += 7;
    if (boostOptions['homepage-spotlight']) total += 20;
    if (boostOptions['urgent-tag']) total += 5;
    if (boostOptions['multi-chain-tag']) total += 10;
    return total;
  };

  const hasAtLeastOneImage = imagePreviews.some((src) => !!src);
  const trimmedProjectName = projectName.trim();
  const trimmedAdTitle = adTitle.trim();
  const trimmedDescription = projectDescription.trim();
  const titleLength = trimmedAdTitle.length;
  const descLength = projectDescription.length;

  const isFormValid =
    !!trimmedProjectName &&
    titleLength >= AD_TITLE_MIN &&
    titleLength <= AD_TITLE_MAX &&
    hasAtLeastOneImage &&
    trimmedDescription.length >= DESC_MIN &&
    (blockchainFocus !== 'Other' || !!blockchainOther.trim());

  const adTitleCounter = getAdTitleCounterText(titleLength);
  const descCounter = getDescriptionCounterText(descLength);

  const handlePreview = () => {
    const nextErrors: typeof errors = {};

    if (!trimmedProjectName) {
      nextErrors.projectName = 'Project name is required.';
    }

    if (!trimmedAdTitle || titleLength < AD_TITLE_MIN || titleLength > AD_TITLE_MAX) {
      nextErrors.adTitle = `Ad title must be between ${AD_TITLE_MIN} and ${AD_TITLE_MAX} characters.`;
    }

    if (!hasAtLeastOneImage) {
      nextErrors.images = 'At least one image is required.';
    }

    if (!trimmedDescription || trimmedDescription.length < DESC_MIN) {
      nextErrors.projectDescription = `Project description must be at least ${DESC_MIN} characters (${DESC_MIN - trimmedDescription.length} more needed).`;
    }

    if (blockchainFocus === 'Other' && !blockchainOther.trim()) {
      nextErrors.blockchainOther = 'Please enter your blockchain name.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      const order: (keyof typeof nextErrors)[] = [
        'projectName',
        'adTitle',
        'images',
        'projectDescription',
        'blockchainOther',
      ];
      for (const key of order) {
        if (!nextErrors[key]) continue;
        const ref =
          key === 'projectName'
            ? projectNameRef
            : key === 'adTitle'
              ? adTitleRef
              : key === 'images'
                ? imagesRef
                : key === 'blockchainOther'
                  ? specsRef
                  : projectDescriptionRef;
        if (ref.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      }

      return;
    }

    setErrors({});

    // Normalize deadline: only submit today or a future date; if past (e.g. restored draft), use today
    const today = getTodayLocal();
    const resolvedDeadline =
      noFixedDeadline || !deadline
        ? undefined
        : deadline < today
          ? today
          : deadline;
    if (deadline && deadline < today) {
      setDeadline(today);
    }
    const resolvedBlockchain =
      blockchainFocus === 'Other' ? blockchainOther.trim() : blockchainFocus;

    onNext({
      projectName: trimmedProjectName,
      adTitle: trimmedAdTitle,
      projectDescription: trimmedDescription,
      blockchainFocus: resolvedBlockchain,
      blockchainOther: blockchainFocus === 'Other' ? blockchainOther.trim() : undefined,
      roleType,
      toolsStack: toolsStack.trim() || undefined,
      paymentType,
      amount,
      deadline: resolvedDeadline ?? '',
      noFixedDeadline,
      visibility,
      boostOptions,
      images,
      imagePreviews,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto mt-15">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Tell Us About The Project
        </h2>

        <div className='border-[0.2px] border-white/20 rounded-[20px] px-25 py-15'>
          {/* Project Name */}
        <div className="mb-6" ref={projectNameRef}>
          <label className="font-semibold text-white mb-2 block">
            Project Name<span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Input your project name"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              if (errors.projectName) {
                setErrors((prev) => ({ ...prev, projectName: undefined }));
              }
            }}
            className="w-full bg-[#141414] border-none text-white placeholder:text-[#606060] h-10"
          />
          {errors.projectName && (
            <p className="text-sm text-red-500 mt-1 text-right">{errors.projectName}</p>
          )}
        </div>

        {/* Ad Title */}
        <div className="mb-6" ref={adTitleRef}>
          <label className="font-semibold text-white mb-2 block">
            Ad Title (short headline)<span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Write a short headline"
            value={adTitle}
            maxLength={AD_TITLE_MAX}
            onChange={(e) => {
              setAdTitle(e.target.value.replace(/\n/g, ' '));
              if (errors.adTitle) {
                setErrors((prev) => ({ ...prev, adTitle: undefined }));
              }
            }}
            className="w-full bg-[#141414] border-none text-white placeholder:text-[#606060] h-10"
          />
          <p
            className={`text-sm mt-1 text-right ${
              adTitleCounter.tone === 'error'
                ? 'text-red-500'
                : adTitleCounter.tone === 'ok'
                  ? 'text-green-500'
                  : 'text-[#FF9631]'
            }`}
          >
            {adTitleCounter.line}
          </p>
          {errors.adTitle && (
            <p className="text-sm text-red-500 mt-1 text-right">{errors.adTitle}</p>
          )}
        </div>

        {/* Upload Images */}
        <div className="mb-6" ref={imagesRef}>
          <label className="font-semibold text-white mb-2 block">
            Upload Images<span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3 flex-wrap">
            {[0, 1, 2].map((index) => (
              <React.Fragment key={index}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={el => { fileInputRefs.current[index] = el; }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    handleImageChange(index, file);
                    if (errors.images) {
                      setErrors((prev) => ({ ...prev, images: undefined }));
                    }
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => triggerFileInput(index)}
                  className="w-full min-w-[120px] max-w-[160px] h-32 lg:h-38 bg-[#141414] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border hover:border-[#606060] transition-colors overflow-hidden border border-transparent"
                >
                  {imagePreviews[index] ? (
                    <img
                      src={imagePreviews[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Upload size={24} className="text-[#606060] mb-2 flex-shrink-0" />
                      <p className="text-xs text-[#606060] text-center px-2">
                        Upload (1:1 min 400×400)
                      </p>
                    </>
                  )}
                </button>
              </React.Fragment>
            ))}
            <div className="w-full min-w-[120px] max-w-[160px] h-32 lg:h-38 bg-[#141414] rounded-lg flex items-center justify-center cursor-pointer hover:border hover:border-[#606060] transition-colors border border-dashed border-[#404040]">
              <Plus size={32} className="text-[#606060]" />
            </div>
          </div>
          {errors.images && (
            <p className="text-sm text-red-500 mt-3 text-right">{errors.images}</p>
          )}
        </div>

        {/* Project Description */}
        <div className="mb-6" ref={projectDescriptionRef}>
          <label className="font-semibold text-white mb-2 block">
            Project Description<span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Describe the project, scope, deliverables, and what you're looking for…"
            value={projectDescription}
            onChange={(e) => {
              setProjectDescription(e.target.value);
              if (errors.projectDescription) {
                setErrors((prev) => ({ ...prev, projectDescription: undefined }));
              }
            }}
            className="w-full bg-[#141414] border-none text-white placeholder:text-[#606060] min-h-[200px] !resize-y"
          />
          <p
            className={`text-sm mt-1 text-right ${
              descCounter.tone === 'ok' ? 'text-green-500' : 'text-[#FF9631]'
            }`}
          >
            {descCounter.line}
          </p>
          {errors.projectDescription && (
            <p className="text-sm text-red-500 mt-1 text-right">{errors.projectDescription}</p>
          )}
        </div>

        {/* Project Specifications */}
        <div className="mb-6 space-y-4" ref={specsRef}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <label className="text-sm font-semibold text-white">Blockchain Focus</label>
            <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
              <Select
                value={blockchainFocus}
                onValueChange={(value) => {
                  setBlockchainFocus(value);
                  if (value !== 'Other') setBlockchainOther('');
                  if (errors.blockchainOther) {
                    setErrors((prev) => ({ ...prev, blockchainOther: undefined }));
                  }
                }}
              >
                <SelectTrigger className="w-[250px] bg-[#141414] border-none text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141414] border-none text-white">
                  <SelectItem value="Solana">Solana</SelectItem>
                  <SelectItem value="Ethereum">Ethereum</SelectItem>
                  <SelectItem value="Base">Base</SelectItem>
                  <SelectItem value="Polygon">Polygon</SelectItem>
                  <SelectItem value="Aptos">Aptos</SelectItem>
                  <SelectItem value="Movement">Movement</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {blockchainFocus === 'Other' && (
                <Input
                  type="text"
                  placeholder="Enter blockchain name"
                  value={blockchainOther}
                  onChange={(e) => {
                    setBlockchainOther(e.target.value);
                    if (errors.blockchainOther) {
                      setErrors((prev) => ({ ...prev, blockchainOther: undefined }));
                    }
                  }}
                  className="w-[250px] bg-[#141414] border-none text-white placeholder:text-[#606060] h-10"
                />
              )}
              {errors.blockchainOther && (
                <p className="text-sm text-red-500 text-right">{errors.blockchainOther}</p>
              )}
            </div>
          </div>

          {roleType ? (
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white">Role type</label>
              <span className="text-sm text-white/90 w-[250px] text-right">{roleType}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <label className="text-sm font-semibold text-white">Tools / stack</label>
            <Input
              type="text"
              placeholder="e.g. React, Solidity, Figma"
              value={toolsStack}
              onChange={(e) => setToolsStack(e.target.value)}
              className="w-[250px] bg-[#141414] border-none text-white placeholder:text-[#606060] h-10"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white">Payment Type</label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger className="w-[250px] bg-[#141414] border-none text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#404040] text-white">
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
                {/* <SelectItem value="ETH">ETH</SelectItem> */}
                <SelectItem value="SOL">SOL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white">Amount</label>
            <Input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-[250px] bg-[#141414] border-none text-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white">Deadline</label>
            <div>
              <Input
                type="date"
                min={minDate}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={noFixedDeadline}
                className="w-[250px] bg-[#141414] border-none text-white placeholder:text-[#606060] [color-scheme:dark]"
              />
              <p className="text-xs text-white/60 mt-1">Select a date from today onward</p>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                className='border-[#FF9631]'
                  id="no-deadline"
                  checked={noFixedDeadline}
                  onCheckedChange={(checked) => {
                    setNoFixedDeadline(checked as boolean);
                    if (checked) setDeadline('');
                  }}
                />
                <label htmlFor="no-deadline" className="text-sm text-[#FF9631] cursor-pointer">
                  No fixed deadline
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className='border-t-[0.2px] border-0 border-white/20 mt-3 mb-10'></div>

        {/* Category Display - shows category chosen in step 1 */}
        <div className="mb-6">
          <label className="text-[18px] text-white mb-2 block">Category</label>
          <div className='border-t-[0.2px] border-0 border-white/20 mt-5 mb-6'></div>
          <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-[4px]">
            <div className="bg-[#141414] rounded-[4px] py-4 px-5 flex items-center justify-between">
              <span className="text-white">{getCategoryDisplayName(initialData?.category)}</span>
              <span className="text-[#A1A1AA]">{initialData?.subcategory || '—'}</span>
              <span className="text-[#FF9631] font-semibold">$5</span>
            </div>
          </div>
        </div>

        {/* Visibility Options */}
        <div className="mb-6">
          <h3 className="text-[18px] text-white mb-4">
            Choose how visible you want this post to be
          </h3>
          <div className='border-t-[0.2px] border-0 border-white/20 mt-5 mb-6'></div>
          <div className="space-y-3">
            {[
              { id: 'free', description: 'Listed for 28 days', price: '$0' },
              { id: 'plus', description: 'Highlighted in listings + top for 1 day', price: '$5' },
              { id: 'premium', description: 'Top for 7 days + featured badge + show on homepage', price: '$15' },
            ].map((option) => {
              const isSelected = visibility === option.id;
              return (
                <div
                  key={option.id}
                  className={`rounded-[4px] p-[1px] transition-all group ${
                    isSelected
                      ? 'bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)]'
                      : 'bg-transparent hover:bg-gradient-to-r hover:from-[rgba(236,72,153,0.3)] hover:to-[rgba(250,204,21,0.3)]'
                  }`}
                >
                  <button
                    onClick={() => setVisibility(option.id)}
                    className={`w-full flex items-center justify-between rounded-[4px] py-4 px-5 transition-colors bg-[#141414]`}
                  >
                    <div className="text-white font-semibold capitalize mb-1">{option.id}</div>
                    <div className="text-sm text-[#A1A1AA]">{option.description}</div>
                    <div className="text-[#FF9631] font-semibold">{option.price}</div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Boost Options */}
        <div className="mb-6">
          <h3 className="text-[18px] text-white mb-4">
            Boost your ads&apos; reach
          </h3>
          <div className='border-t-[0.2px] border-0 border-white/20 mt-5 mb-6'></div>
          <div className="space-y-3">
            {[
              { id: 'auto-bump', description: 'Pushes your ad to the top every 24h for 3 days', price: '$7' },
              { id: 'homepage-spotlight', description: 'Displayed on homepage under "Top Picks"', price: '$20' },
              { id: 'urgent-tag', description: 'Red urgency tag, filterable', price: '$5' },
              { id: 'multi-chain-tag', description: 'Appear under multiple blockchains', price: '$10' },
            ].map((option) => {
              const isSelected = boostOptions[option.id];
              return (
                <div
                  key={option.id}
                  className={`rounded-[4px] p-[1px] transition-all group ${
                    isSelected
                      ? 'bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)]'
                      : 'bg-transparent hover:bg-gradient-to-r hover:from-[rgba(236,72,153,0.3)] hover:to-[rgba(250,204,21,0.3)]'
                  }`}
                >
                  <button
                    onClick={() => handleBoostToggle(option.id)}
                    className="w-full flex items-center justify-between rounded-[4px] py-4 px-5 transition-colors bg-[#141414]"
                  >
                    <div className="text-white font-semibold mb-1">{option.id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div className="text-sm text-[#A1A1AA]">{option.description}</div>
                    <div className="text-[#FF9631] font-semibold">{option.price}</div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-[#27272A]"
          >
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-white">
              Sub-Total: <span className="font-semibold text-[#FF9631]">${calculateSubtotal()}</span>
            </div>
            <Button
              onClick={handlePreview}
              disabled={!isFormValid}
              className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Preview
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

