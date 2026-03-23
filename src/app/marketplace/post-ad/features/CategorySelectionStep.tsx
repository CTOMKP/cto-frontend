"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

const categories: Category[] = [
  {
    id: 'developers',
    name: 'Developers',
    subcategories: [
      'Smart Contract Dev',
      'Frontend Dev',
      'Backend Dev',
      'Full Stack',
      'Blockchain Integration',
      '3D / NFT Artist',
      'Bot Developer',
    ],
  },
  {
    id: 'design-branding',
    name: 'Design & Branding',
    subcategories: [
      'UI/UX Designer',
      'Graphic Designer',
      'Motion Designer',
      'Meme Designer',
      'Branding Strategist',
    ],
  },
  {
    id: 'shilling-marketing',
    name: 'Shilling & Marketing',
    subcategories: [
      'Shillers',
      'Influencer Outreach',
      'Growth Hacker',
      'Social Media Manager',
      'Paid Ads / Campaign',
      'Meme Creator',
    ],
  },
  {
    id: 'tokenomics-strategy',
    name: 'Tokenomics & Strategy',
    subcategories: [
      'Tokenomics Analyst',
      'On-chain Economist',
      'Project Strategist',
      'DAO Architect',
      'Revenue Model Planner',
    ],
  },
  {
    id: 'advisory-leadership',
    name: 'Advisory & Leadership',
    subcategories: [
      'CTO',
      'Founder/Co-founder',
      'Advisor',
      'Moderator Lead',
      'Project Manager',
      'Community DAO Lead',
    ],
  },
  {
    id: 'community-operations',
    name: 'Community & Operations',
    subcategories: [
      'Telegram / Discord Mod',
      'Admin / Support',
      'Community Builder',
      'Partnerships Manager',
      'Event Organizer',
      'HR / Team Coordinator',
    ],
  },
  {
    id: 'project-listings',
    name: 'Project Listings (For Takeover)',
    subcategories: [
      'CTO Wanted',
      'Rugged Project Revival',
      'New Meme Launch',
      'DAO Takeover',
      'Partnership Requests',
      'Builder Wanted',
    ],
  },
  {
    id: 'nft-art',
    name: 'NFT & Art',
    subcategories: [
      'NFT Artist',
      '3D Animator',
      'Concept Artist',
      'Collection Manager',
      'NFT Strategist',
    ],
  },
  {
    id: 'tools-services',
    name: 'Tools & Services',
    subcategories: [
      'Analytics Tools',
      'Security / Audit Service',
      'Launchpad Service',
      'Automation / API',
      'Dev Tool / Plugin',
      'Marketing Tool',
    ],
  },
  {
    id: 'writing-content',
    name: 'Writing & Content',
    subcategories: [
      'Copywriter',
      'Whitepaper Writer',
      'Meme Writer',
      'Community Announcer',
      'Script Writer',
      'Translator',
    ],
  },
];

interface CategorySelectionStepProps {
  onNext: (data: { category: string; subcategory: string; postType?: 'LOOKING_FOR' | 'OFFERING' }) => void;
}

export default function CategorySelectionStep({ onNext }: CategorySelectionStepProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [subcategoryInputOpen, setSubcategoryInputOpen] = useState(false);
  const [postType, setPostType] = useState<'LOOKING_FOR' | 'OFFERING'>('LOOKING_FOR');

  const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    setSubcategoryInputOpen(true);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setSubcategoryInputOpen(false);
  };

  const handleCreatePost = () => {
    if (selectedCategory && selectedSubcategory) {
      onNext({
        category: selectedCategory,
        subcategory: selectedSubcategory,
        postType,
      });
    }
  };

  return (
    <div className="">
      <div className="max-w-4xl mx-auto my-17 border-[0.2px] border-white/20 rounded-lg p-4">
        <Tabs defaultValue="looking-for" onValueChange={(v) => setPostType(v === 'offering' ? 'OFFERING' : 'LOOKING_FOR')}>
          <TabsList className="flex gap-2 mb-8 bg-transparent p-2 h-11 border-[0.2px] border-white/20 rounded-lg">
            <TabsTrigger
              value="looking-for"
              className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors data-[state=active]:bg-[#17171C] data-[state=active]:text-white data-[state=inactive]:bg-black data-[state=inactive]:text-[#A1A1AA]"
            >
              Looking for
            </TabsTrigger>
            <TabsTrigger
              value="offering"
              className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors data-[state=active]:bg-[#17171C] data-[state=active]:text-white data-[state=inactive]:bg-black data-[state=inactive]:text-[#A1A1AA]"
            >
              Offering
            </TabsTrigger>
          </TabsList>

          <TabsContent value="looking-for" className="mt-14 border-[0.2px] border-white/20 rounded-lg p-6 w-[664px] mx-auto">
            {/* Category Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white mb-4">
                Category<span className="text-red-500">*</span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    variant="ghost"
                    className={`flex w-fit items-center gap-2 p-3 h-12 rounded-lg border transition-colors ${
                      selectedCategory === category.id
                        ? 'border-white bg-[#27272A] text-white hover:bg-[#27272A]'
                        : 'border-white/20 bg-[#151515] text-[#A1A1AA] hover:border-[#606060]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedCategory === category.id
                          ? 'border-white'
                          : 'border-[#606060]'
                      }`}
                    >
                      {selectedCategory === category.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Subcategory Selection */}
            {selectedCategory && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Subcategory
                </h3>
                {subcategoryInputOpen ? (
                  <div>
                    <div className='relative flex items-center justify-between'>
                    <Input
                      disabled 
                      type="text"
                      placeholder="Select or input sub category"
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="w-full bg-[#1A1A1A] border-[#404040] text-white placeholder:text-[#606060] pr-10"
                    />
                    <button
                      onClick={() => setSubcategoryInputOpen(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
                    >
                      {subcategoryInputOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    </div>
                    <div className="mt-2 text-xs text-[#A1A1AA]">
                      Be more specific (e.g. Smart Contract Dev, Meme Designer, Space Host)
                    </div>
                    {/* Subcategory Dropdown */}
                    {selectedCategoryData && (
                      <div className="mt-2 border border-[#404040] rounded-lg bg-[#1A1A1A] max-h-60 overflow-y-auto hover-scrollbar">
                        {selectedCategoryData.subcategories.map((subcategory) => (
                          <button
                            key={subcategory}
                            onClick={() => handleSubcategorySelect(subcategory)}
                            className="w-full text-left py-2 px-4 text-sm text-white hover:bg-[#27272A] transition-colors"
                          >
                            {subcategory}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setSubcategoryInputOpen(true)}
                      className="w-full flex items-center justify-between py-3 px-4 rounded-lg bg-[#1A1A1A] border border-[#404040] text-left"
                    >
                      <span className={selectedSubcategory ? 'text-white' : 'text-[#606060]'}>
                        {selectedSubcategory || 'Select or input sub category'}
                      </span>
                      <ChevronDown size={20} className="text-[#A1A1AA]" />
                    </button>
                    <div className="mt-2 text-xs text-[#A1A1AA]">
                      Be more specific (e.g. Smart Contract Dev, Meme Designer, Space Host)
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create Post Button */}
            <div className="mt-8">
              <Button
                onClick={handleCreatePost}
                className="w-full h-10 bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
                disabled={!selectedCategory}
              >
                Create post
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="offering" className="mt-0">
            {/* Empty for now */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

