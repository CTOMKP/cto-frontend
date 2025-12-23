"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Upload, Plus } from 'lucide-react';

export interface ProjectDetailsData {
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
}

interface ProjectDetailsStepProps {
  onNext: (data: ProjectDetailsData) => void;
  onBack: () => void;
  initialData?: ProjectDetailsData;
}

export default function ProjectDetailsStep({ onNext, onBack, initialData }: ProjectDetailsStepProps) {
  const [projectName, setProjectName] = useState(initialData?.projectName || '');
  const [adTitle, setAdTitle] = useState(initialData?.adTitle || '');
  const [projectDescription, setProjectDescription] = useState(initialData?.projectDescription || '');
  const [blockchainFocus, setBlockchainFocus] = useState(initialData?.blockchainFocus || 'Solana');
  const [roleType, setRoleType] = useState(initialData?.roleType || 'Designer');
  const [toolsStack, setToolsStack] = useState(initialData?.toolsStack || 'Adobe Illustrator');
  const [paymentType, setPaymentType] = useState(initialData?.paymentType || 'USDT');
  const [amount, setAmount] = useState(initialData?.amount || '10,000');
  const [deadline, setDeadline] = useState(initialData?.deadline || '');
  const [noFixedDeadline, setNoFixedDeadline] = useState(initialData?.noFixedDeadline || false);
  const [visibility, setVisibility] = useState(initialData?.visibility || 'free');
  const [boostOptions, setBoostOptions] = useState<Record<string, boolean>>(initialData?.boostOptions || {});

  const handleBoostToggle = (option: string) => {
    setBoostOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const calculateSubtotal = () => {
    let total = 0;
    if (visibility === 'plus') total += 5;
    if (visibility === 'premium') total += 15;
    if (boostOptions['auto-bump']) total += 7;
    if (boostOptions['homepage-spotlight']) total += 20;
    if (boostOptions['urgent-tag']) total += 5;
    if (boostOptions['multi-chain-tag']) total += 10;
    return total;
  };

  const handlePreview = () => {
    onNext({
      projectName,
      adTitle,
      projectDescription,
      blockchainFocus,
      roleType,
      toolsStack,
      paymentType,
      amount,
      deadline,
      noFixedDeadline,
      visibility,
      boostOptions,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 mt-25">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Tell Us About The Project
        </h2>

        <div className='border-[0.2px] border-white/20 rounded-[20px] mt-[90px] px-25 py-15'>
          {/* Project Name */}
        <div className="mb-6">
          <label className="font-semibold text-white mb-2 block">
            Project Name<span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Input your project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full bg-[#141414] border-none text-white placeholder:text-[#606060] h-10"
          />
        </div>

        {/* Ad Title */}
        <div className="mb-6">
          <label className="font-semibold text-white mb-2 block">
            Ad Title (short headline)<span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Write a short headline"
            value={adTitle}
            onChange={(e) => setAdTitle(e.target.value)}
            className="w-full bg-[#141414] min-h-[160px] border-none text-white placeholder:text-[#606060]"
          />
          <p className="text-sm text-[#FF9631] mt-1 text-right">8-60 characters, required</p>
        </div>

        {/* Upload Images */}
        <div className="mb-6">
          <label className="font-semibold text-white mb-2 block">
            Upload Images<span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="w-full h-32 lg:h-38 bg-[#141414] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border hover:border-[#606060] transition-colors"
              >
                <Upload size={24} className="text-[#606060] mb-2" />
                <p className="text-xs text-[#606060] text-center px-2">
                  Upload Square image (1:1 min 400x400px)
                </p>
              </div>
            ))}
            <div className="w-full h-32 lg:h-38 bg-[#141414] rounded-lg flex items-center justify-center cursor-pointer hover:border hover:border-[#606060] transition-colors">
              <Plus size={32} className="text-[#606060]" />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              className="text-[#FF9631] p-0 h-auto text-sm border border-[#FF9631] py-2.5 px-5 rounded-[20px] bg-[#FF9631]/20"
            >
              Upgrade to premium
            </Button>
            <span className="text-sm text-[#FF9631]">To add more than 3 images.</span>
          </div>
        </div>

        {/* Project Description */}
        <div className="mb-6">
          <label className="font-semibold text-white mb-2 block">
            Project Description<span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Write a short headline"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full bg-[#141414] border-none text-white placeholder:text-[#606060] min-h-[120px]"
          />
          <p className="text-sm text-[#FF9631] mt-1 text-right">800 characters, required</p>
        </div>

        {/* Project Specifications */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white">Blockchain Focus</label>
            <Select value={blockchainFocus} onValueChange={setBlockchainFocus}>
              <SelectTrigger className="w-[250px] bg-[#141414] border-none text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-none text-white">
                <SelectItem value="Solana">Solana</SelectItem>
                <SelectItem value="Ethereum">Ethereum</SelectItem>
                <SelectItem value="Base">Base</SelectItem>
                <SelectItem value="Polygon">Polygon</SelectItem>
                <SelectItem value="Aptos">Aptos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white">Role Type</label>
            <Select value={roleType} onValueChange={setRoleType}>
              <SelectTrigger className="w-[250px] bg-[#141414] border-none text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#404040] text-white">
                <SelectItem value="Designer">Designer</SelectItem>
                <SelectItem value="Developer">Developer</SelectItem>
                <SelectItem value="Marketer">Marketer</SelectItem>
                <SelectItem value="Writer">Writer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white">Tools/Stack</label>
            <Select value={toolsStack} onValueChange={setToolsStack}>
              <SelectTrigger className="w-[250px] bg-[#141414] border-none text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#404040] text-white">
                <SelectItem value="Adobe Illustrator">Adobe Illustrator</SelectItem>
                <SelectItem value="Figma">Figma</SelectItem>
                <SelectItem value="React">React</SelectItem>
                <SelectItem value="Solidity">Solidity</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="ETH">ETH</SelectItem>
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
              <div className="relative">
                <Input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={noFixedDeadline}
                  className="w-[250px] bg-[#141414] border-none text-white placeholder:text-[#606060] pr-10"
                />
                <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              </div>
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

        {/* Category Display */}
        <div className="mb-6">
          <label className="text-[18px] text-white mb-2 block">Category</label>
          <div className='border-t-[0.2px] border-0 border-white/20 mt-5 mb-6'></div>
          <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-[4px]">
            <div className="bg-[#141414] rounded-[4px] py-4 px-5 flex items-center justify-between">
              <span className="text-white">Developer</span>
              <span>FULL STACK</span>
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
              className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
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

