"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { marketplaceService } from "@/services/marketplaceService";
import { cn } from "@/lib/utils";

export type MarketplaceCategoryOption = {
  id: string;
  name: string;
  subcategories: string[];
};

/** Same fallback catalog as post-ad CategorySelectionStep */
export const MARKETPLACE_FALLBACK_CATEGORIES: MarketplaceCategoryOption[] = [
  {
    id: "developers",
    name: "Developers",
    subcategories: [
      "Smart Contract Dev",
      "Frontend Dev",
      "Backend Dev",
      "Full Stack",
      "Blockchain Integration",
      "3D / NFT Artist",
      "Bot Developer",
    ],
  },
  {
    id: "design-branding",
    name: "Design & Branding",
    subcategories: [
      "UI/UX Designer",
      "Graphic Designer",
      "Motion Designer",
      "Meme Designer",
      "Branding Strategist",
    ],
  },
  {
    id: "shilling-marketing",
    name: "Shilling & Marketing",
    subcategories: [
      "Shillers",
      "Influencer Outreach",
      "Growth Hacker",
      "Social Media Manager",
      "Paid Ads / Campaign",
      "Meme Creator",
    ],
  },
  {
    id: "tokenomics-strategy",
    name: "Tokenomics & Strategy",
    subcategories: [
      "Tokenomics Analyst",
      "On-chain Economist",
      "Project Strategist",
      "DAO Architect",
      "Revenue Model Planner",
    ],
  },
  {
    id: "advisory-leadership",
    name: "Advisory & Leadership",
    subcategories: [
      "CTO",
      "Founder/Co-founder",
      "Advisor",
      "Moderator Lead",
      "Project Manager",
      "Community DAO Lead",
    ],
  },
  {
    id: "community-operations",
    name: "Community & Operations",
    subcategories: [
      "Telegram / Discord Mod",
      "Admin / Support",
      "Community Builder",
      "Partnerships Manager",
      "Event Organizer",
      "HR / Team Coordinator",
    ],
  },
  {
    id: "project-listings",
    name: "Project Listings (For Takeover)",
    subcategories: [
      "CTO Wanted",
      "Rugged Project Revival",
      "New Meme Launch",
      "DAO Takeover",
      "Partnership Requests",
      "Builder Wanted",
    ],
  },
  {
    id: "nft-art",
    name: "NFT & Art",
    subcategories: [
      "NFT Artist",
      "3D Animator",
      "Concept Artist",
      "Collection Manager",
      "NFT Strategist",
    ],
  },
  {
    id: "tools-services",
    name: "Tools & Services",
    subcategories: [
      "Analytics Tools",
      "Security / Audit Service",
      "Launchpad Service",
      "Automation / API",
      "Dev Tool / Plugin",
      "Marketing Tool",
    ],
  },
  {
    id: "writing-content",
    name: "Writing & Content",
    subcategories: [
      "Copywriter",
      "Whitepaper Writer",
      "Meme Writer",
      "Community Announcer",
      "Script Writer",
      "Translator",
    ],
  },
];

type MarketplaceCategoryDropdownsProps = {
  categoryId: string | null;
  subcategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onSubcategoryChange: (subcategory: string | null) => void;
};

const TriggerButton = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    open: boolean;
    disabled?: boolean;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function TriggerButton({ label, open, disabled, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={cn(
        "flex h-9 min-w-[140px] items-center justify-between gap-3 rounded-lg border-[0.5px] border-[#FFFFFF20] bg-transparent px-3 text-sm text-[#FFFFFF80]",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:bg-white/5 hover:text-white",
        className,
      )}
      {...props}
    >
      <span className="truncate">{label}</span>
      <ChevronDown
        size={16}
        className={cn(
          "shrink-0 text-[#FFFFFF80] transition-transform duration-200",
          open && "rotate-180",
        )}
      />
    </button>
  );
});

export default function MarketplaceCategoryDropdowns({
  categoryId,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
}: MarketplaceCategoryDropdownsProps) {
  const [categories, setCategories] = useState<MarketplaceCategoryOption[]>(
    MARKETPLACE_FALLBACK_CATEGORIES,
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);

  useEffect(() => {
    let active = true;
    marketplaceService
      .getPricing()
      .then((catalog) => {
        if (!active || !catalog.categories?.length) return;
        setCategories(
          catalog.categories
            .filter((category) => category.active !== false)
            .map((category) => ({
              id: category.id,
              name: category.name,
              subcategories: category.subcategories
                .filter((sub) => sub.active !== false)
                .map((sub) => sub.name),
            })),
        );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const categoryLabel = selectedCategory?.name ?? "Category";
  const subcategoryLabel = subcategory || "Sub Category";
  const subcategoryEnabled = !!selectedCategory;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DropdownMenuTrigger asChild>
          <TriggerButton label={categoryLabel} open={categoryOpen} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-72 w-56 overflow-y-auto border-[#FFFFFF20] bg-[#0B0B0E] text-white hover-scrollbar"
        >
          <DropdownMenuItem
            className="text-[#FFFFFF80] focus:bg-white/10 focus:text-white"
            onSelect={() => {
              onCategoryChange(null);
              onSubcategoryChange(null);
            }}
          >
            All categories
          </DropdownMenuItem>
          {categories.map((category) => (
            <DropdownMenuItem
              key={category.id}
              className="focus:bg-white/10 focus:text-white"
              onSelect={() => {
                onCategoryChange(category.id);
                onSubcategoryChange(null);
              }}
            >
              {category.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu
        open={subcategoryEnabled ? subcategoryOpen : false}
        onOpenChange={(open) => {
          if (!subcategoryEnabled) return;
          setSubcategoryOpen(open);
        }}
      >
        <DropdownMenuTrigger asChild disabled={!subcategoryEnabled}>
          <TriggerButton
            label={subcategoryLabel}
            open={subcategoryEnabled && subcategoryOpen}
            disabled={!subcategoryEnabled}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-72 w-56 overflow-y-auto border-[#FFFFFF20] bg-[#0B0B0E] text-white hover-scrollbar"
        >
          <DropdownMenuItem
            className="text-[#FFFFFF80] focus:bg-white/10 focus:text-white"
            onSelect={() => onSubcategoryChange(null)}
          >
            All sub categories
          </DropdownMenuItem>
          {(selectedCategory?.subcategories ?? []).map((sub) => (
            <DropdownMenuItem
              key={sub}
              className="focus:bg-white/10 focus:text-white"
              onSelect={() => onSubcategoryChange(sub)}
            >
              {sub}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Match ads against selected create-ad category / subcategory. */
export function matchesCategorySelection(
  ad: { category?: string | null; subCategory?: string | null },
  categoryId: string | null,
  subcategory: string | null,
  categories: MarketplaceCategoryOption[] = MARKETPLACE_FALLBACK_CATEGORIES,
): boolean {
  if (!categoryId && !subcategory) return true;

  const adCategory = String(ad.category || "").trim().toLowerCase();
  const adSub = String(ad.subCategory || "").trim().toLowerCase();
  const selected = categories.find((c) => c.id === categoryId);

  if (categoryId) {
    const idMatch = adCategory === categoryId.toLowerCase();
    const nameMatch = selected
      ? adCategory === selected.name.toLowerCase()
      : false;
    if (!idMatch && !nameMatch) return false;
  }

  if (subcategory) {
    if (adSub !== subcategory.toLowerCase()) return false;
  }

  return true;
}
