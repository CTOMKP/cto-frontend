"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Step1 from "./features/Step1";
import Step2, { SocialLinks } from "./features/Step2";
import Step3 from "./features/Step3";
import Step4 from "./features/Step4";
import { Hourglass } from "lucide-react";
import { userListingsService, ScanResult, CreateUserListingPayload } from "@/services/userListingsService";
import { toast } from "react-toastify";

const networks = [
  {
    name: "Aptos",
    src: "/listings-chains/aptos.png",
  },
  // {
  //   name: "Ethereum",
  //   src: "/listings-chains/ethereum.png",
  // },
  {
    name: "Solana",
    src: "/listings-chains/solana.png",
  },
  {
    name: "BNB",
    src: "/listings-chains/bnb.png",
  },
  {
    name: "Movement",
    src: "/listings-chains/movement.png",
  },
  {
    name: "Base",
    src: "/listings-chains/base.png",
  },
  {
    name: "Monad",
    src: "/listings-chains/monad.png",
  },
];

const info = [
  {
    title: "Smart contract audit",
    description: "Automated vulnerability detection and security analysis",
    image: "/Overlay.svg",
  },
  {
    title: "Wallet behaviour",
    description: "Reputation engine and suspicious activity detection ",
    image: "/Overlay-1.svg",
  },
  {
    title: "Accurate results",
    description: "Real time blockchain with comprehensive risk scoring",
    image: "/Overlay-2.svg",
  },
  {
    title: "Tier classification",
    description: "Four-tier system from seed to stellar ratings",
    image: "/Overlay-3.svg",
  },
];

const getStarted = [
  {
    title: "Submit Your Contract",
    description:
      "Paste your token contract (Aptos, Solana, ETH, etc.) to start the vetting process",
  },
  {
    title: "Automated analysis",
    description:
      "Our system checks security, liquidity, wallets, and sentiment.",
  },
  {
    title: "Get Listed",
    description: "Get your badge tier, add project info, and go live",
  },
];

const DRAFT_KEY = 'cto_draft_listing_id';

export default function ListingApplication() {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("solana");

  // Clear stale draft when starting a new listing flow (match cto-test-frontend)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);
  const [networkDialogueOpen, setNetworkDialogueOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showStep4, setShowStep4] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [bio, setBio] = useState<string>('');
  const [links, setLinks] = useState<SocialLinks>({
    website: '',
    twitter: '',
    telegram: '',
    discord: '',
  });

  const getDraftId = useCallback(() => draftId || (typeof window !== 'undefined' ? localStorage.getItem(DRAFT_KEY) : null), [draftId]);

  /**
   * Ensures we have a draft ID: returns existing or creates one (only when createIfMissing is true).
   * Draft is only created when user clicks "Continue" from Step 2 — never during image upload,
   * so we never send create() before the user has chosen to save progress.
   */
  const ensureDraftExists = useCallback(async (
    payload: {
      title?: string;
      description?: string;
      bio?: string;
      logoUrl?: string;
      bannerUrl?: string;
      links?: SocialLinks;
    },
    options?: { createIfMissing?: boolean }
  ) => {
    const createIfMissing = options?.createIfMissing !== false;
    const existing = getDraftId();
    if (existing) {
      const updates: Record<string, unknown> = {};
      if (payload.bio !== undefined) updates.bio = payload.bio;
      if (payload.logoUrl !== undefined) updates.logoUrl = payload.logoUrl;
      if (payload.bannerUrl !== undefined) updates.bannerUrl = payload.bannerUrl;
      if (payload.links !== undefined) updates.links = payload.links;
      if (payload.title !== undefined) updates.title = payload.title;
      if (payload.description !== undefined) updates.description = payload.description;
      if (Object.keys(updates).length > 0) {
        try {
          await userListingsService.update(existing, updates as Partial<CreateUserListingPayload>);
        } catch {}
      }
      return existing;
    }
    // Do not create draft from image upload path — only when user clicks Continue
    if (!createIfMissing) return null;
    if (!scanResult || !contractAddress) return null;
    // Only create draft when token is eligible (match cto-test-frontend)
    if (!scanResult.success || !scanResult.eligible) return null;
    const tier = scanResult.details?.tier || scanResult.tier || scanResult.vettingTier || 'UNQUALIFIED';
    const riskScore = Number(scanResult.details?.risk_score ?? scanResult.risk_score ?? scanResult.vettingScore ?? 0);
    const title = (payload.title ?? (scanResult.metadata?.token_name as string) ?? 'Untitled').trim() || 'Untitled';
    const description = (payload.description ?? '').trim() || ' ';
    const rawBio = (payload.bio ?? bio)?.trim();
    const rawLinks = payload.links ?? links;
    const linkWebsite = rawLinks?.website?.trim() || undefined;
    const linkTwitter = rawLinks?.twitter?.trim() || undefined;
    const linkTelegram = rawLinks?.telegram?.trim() || undefined;
    const linkDiscord = rawLinks?.discord?.trim() || undefined;
    const hasAnyLink = [linkWebsite, linkTwitter, linkTelegram, linkDiscord].some((v) => v != null && v !== '');

    const createPayload: CreateUserListingPayload = {
      contractAddr: contractAddress.trim(),
      chain: selectedNetwork.toUpperCase(),
      title,
      description,
      vettingTier: tier,
      vettingScore: riskScore,
    };
    if (rawBio) createPayload.bio = rawBio;
    if ((payload.logoUrl ?? logoUrl)?.trim()) createPayload.logoUrl = (payload.logoUrl ?? logoUrl)?.trim() || undefined;
    if ((payload.bannerUrl ?? bannerUrl)?.trim()) createPayload.bannerUrl = (payload.bannerUrl ?? bannerUrl)?.trim() || undefined;
    if (hasAnyLink) {
      createPayload.links = {
        website: linkWebsite,
        twitter: linkTwitter,
        telegram: linkTelegram,
        discord: linkDiscord,
      };
    }
    const res = await userListingsService.create(createPayload);
    const data = res?.data ?? res;
    const id = data?.id ?? data?.listingId;
    const backendMessage = (res as { message?: string })?.message ?? (data as { message?: string })?.message;
    if (!id) throw new Error(backendMessage || 'Failed to create draft');
    setDraftId(id);
    if (typeof window !== 'undefined') localStorage.setItem(DRAFT_KEY, id);
    return id;
  }, [scanResult, contractAddress, selectedNetwork, bio, logoUrl, bannerUrl, links, getDraftId]);

  const handleProfilePictureChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(file);
    try {
      setLogoUploading(true);
      // Do not create draft here — only use existing draft so we never send create() before Continue
      const draft = await ensureDraftExists({}, { createIfMissing: false });
      const { viewUrl } = await userListingsService.uploadImageViaPresign(
        draft ? 'profile' : 'generic',
        file,
        draft ? { projectId: draft } : undefined
      );
      setLogoUrl(viewUrl);
      if (draft) {
        try { await userListingsService.update(draft, { logoUrl: viewUrl }); } catch {}
      }
      toast.success('Profile picture uploaded');
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? 'Failed to upload profile picture';
      toast.error(msg);
      setProfilePreview(null);
    } finally {
      setLogoUploading(false);
    }
  }, [ensureDraftExists]);

  const handleBannerChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBannerPreview(reader.result as string);
    reader.readAsDataURL(file);
    try {
      setBannerUploading(true);
      // Do not create draft here — only use existing draft
      const draft = await ensureDraftExists({}, { createIfMissing: false });
      const { viewUrl } = await userListingsService.uploadImageViaPresign(
        draft ? 'banner' : 'generic',
        file,
        draft ? { projectId: draft } : undefined
      );
      setBannerUrl(viewUrl);
      if (draft) {
        try { await userListingsService.update(draft, { bannerUrl: viewUrl }); } catch {}
      }
      toast.success('Banner uploaded');
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? 'Failed to upload banner';
      toast.error(msg);
      setBannerPreview(null);
    } finally {
      setBannerUploading(false);
    }
  }, [ensureDraftExists]);

  const handleStep2Continue = useCallback(async () => {
    try {
      if (scanResult?.eligible) {
        // Draft is created only here (on Continue), not when uploading images
        await ensureDraftExists({ bio, logoUrl: logoUrl || undefined, bannerUrl: bannerUrl || undefined, links }, { createIfMissing: true });
      } else {
        toast.info('You can continue, but saving/publishing requires a higher vetting score.');
      }
      setCurrentStep(3);
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? 'Failed to save draft';
      toast.error(msg);
    }
  }, [ensureDraftExists, scanResult?.eligible, bio, logoUrl, bannerUrl, links]);

  return (
    <div>
      {!showStep4 ? (
        <div className="border border-white/20  rounded-lg mt-[78px] mx-50">
          <div className="flex justify-center items-center gap-3.5 mx-4 border-b border-white/20 pt-3 pb-4">
            <span
              onClick={() => setCurrentStep(1)}
              className={`size-5 rounded-full font-bold text-[10.5px] flex justify-center items-center ${currentStep === 1
                  ? "text-white bg-white/10"
                  : "text-white/30 bg-white/5"
                }`}
            >
              1
            </span>
            <span className="bg-white/30 w-6 h-[1px]"></span>
            <span
              onClick={() => setCurrentStep(2)}
              className={`size-5 rounded-full font-bold text-[10.5px] flex justify-center items-center ${currentStep === 2
                  ? "text-white bg-white/10"
                  : "text-white/30 bg-white/5"
                }`}
            >
              2
            </span>
            <span className="bg-white/30 w-6 h-[1px]"></span>
            <span
              onClick={() => setCurrentStep(3)}
              className={`size-5 rounded-full font-bold text-[10.5px] flex justify-center items-center ${currentStep === 3
                  ? "text-white bg-white/10"
                  : "text-white/30 bg-white/5"
                }`}
            >
              3
            </span>
          </div>

          <h1 className="font-medium text-[62px] text-center">
            {currentStep === 1 && "Get Verified & Grow"}
            {currentStep === 2 && "Listing Details"}
            {currentStep === 3 && "Project roadmap"}
          </h1>
          <div
            className={`flex justify-center items-center gap-3 ${currentStep !== 1 ? "hidden" : ""
              }`}
          >
            <span className="rounded-lg p-1.5 font-bold text-[#6D6D6D] bg-[#6D6D6D]/20 flex items-center gap-2.5">
              <Image
                src="/project-categories/seed.svg"
                alt="seed"
                width={16}
                height={16}
              />{" "}
              Seed
            </span>
            <span className="rounded-lg p-1.5 font-bold text-[#FF5900] bg-[#FF5900]/20 flex items-center gap-2.5">
              <Image
                src="/project-categories/sprout.svg"
                alt="sprout"
                width={16}
                height={16}
              />{" "}
              Seed
            </span>
            <span className="rounded-lg p-1.5 font-bold text-[#15FF00] bg-[#15FF00]/20 flex items-center gap-2.5">
              <Image
                src="/project-categories/bloom.svg"
                alt="bloom"
                width={16}
                height={16}
              />{" "}
              Seed
            </span>
            <span className="rounded-lg p-1.5 font-bold text-[#FFBB00] bg-[#FFBB00]/20 flex items-center gap-2.5">
              <Image
                src="/project-categories/stellar.svg"
                alt="stellar"
                width={16}
                height={16}
              />{" "}
              Seed
            </span>
          </div>

          <div
            className={`border border-white/20 rounded-lg p-6 my-8 max-w-[534px] mx-auto ${currentStep !== 1 ? "mt-4" : ""
              }`}
          >
            {currentStep === 1 && (
              <Step1
                selectedNetwork={selectedNetwork}
                setSelectedNetwork={setSelectedNetwork}
                networkDialogueOpen={networkDialogueOpen}
                setNetworkDialogueOpen={setNetworkDialogueOpen}
                networks={networks}
                setCurrentStep={setCurrentStep}
                onScanResultChange={setScanResult}
                onContractAddressChange={setContractAddress}
              />
            )}

            {currentStep === 2 && (
              <Step2
                profilePreview={profilePreview}
                bannerPreview={bannerPreview}
                logoUrl={logoUrl}
                bannerUrl={bannerUrl}
                logoUploading={logoUploading}
                bannerUploading={bannerUploading}
                handleProfilePictureChange={handleProfilePictureChange}
                handleBannerChange={handleBannerChange}
                setCurrentStep={setCurrentStep}
                onContinue={handleStep2Continue}
                onBioChange={setBio}
                links={links}
                setLinks={setLinks}
              />
            )}

            {currentStep === 3 && (
              <Step3
                draftId={getDraftId()}
                onPaymentSuccess={async () => {
                  const id = getDraftId();
                  if (id) {
                    try {
                      await userListingsService.publish(id);
                    } catch {}
                    localStorage.removeItem(DRAFT_KEY);
                    setDraftId(null);
                  }
                  setShowStep4(true);
                }}
                scanResult={scanResult}
                contractAddress={contractAddress}
                selectedNetwork={selectedNetwork}
                profilePreview={profilePreview}
                bannerPreview={bannerPreview}
                logoUrl={logoUrl}
                bannerUrl={bannerUrl}
                bio={bio}
                links={links}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="border border-white/20 rounded-lg mt-[78px] mx-50">
          <div className="flex flex-col justify-center items-center max-w-[600px] mt-14 mx-auto">
            <div className="bg-[#FFE7A9]/20 size-25 rounded-full flex justify-center items-center">
              <Hourglass size={40} color="#FFCB45" />
            </div>

            <h1 className="font-medium text-[40px] mt-7.5 mb-5 text-center">
              Your Listing Is Under Review
            </h1>

            <p className="text-white/80 text-center">
              Thank you for submitting your project. Our team is reviewing your
              details to ensure they meet our listing standards
            </p>
          </div>
          <div className="border border-white/20 rounded-lg p-6 my-8 max-w-[534px] mx-auto">
            <Step4 scanResult={scanResult} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 px-[100px] mt-4">
        {info.map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-t from-white/40 via-white/10 to-white/5 rounded-3xl p-[1px]"
          >
            <div className="bg-black rounded-3xl h-full p-5 text-white">
              <Image
                className="mb-3"
                src={item.image}
                alt={item.title}
                width={28}
                height={28}
              />
              <h3 className="font-bold text-[18px] mb-3">{item.title}</h3>
              <p className="text-sm text-white/70">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-[100px] mx-[100px] mb-[140px]">
        <h3 className="text-center text-[32px] mb-8">
          Get started in 3 easy steps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {getStarted.map((steps, index) => (
            <div key={index} className="p-8 rounded-lg border border-white/10">
              <div className="flex justify-center">
                <span className="size-6 rounded-full bg-[#FF4A15]/20 flex items-center justify-center mb-3 text-[#FF4A15]">
                  {index + 1}
                </span>
              </div>
              <h4 className="font-semibold text-[18px] text-center mb-3">
                {steps.title}
              </h4>
              <p className="text-white/70  text-sm text-center">
                {steps.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
