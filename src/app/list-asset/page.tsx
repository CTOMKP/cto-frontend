"use client";

import React, { useState } from 'react'
import Image from 'next/image'
import Step1 from './features/Step1'
import Step2 from './features/Step2'
import Step3 from './features/Step3'

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
        image: "/Overlay.svg"
    },
    {
        title: "Wallet behaviour",
        description: "Reputation engine and suspicious activity detection ",
        image: "/Overlay-1.svg"
    },
    {
        title: "Accurate results",
        description: "Real time blockchain with comprehensive risk scoring",
        image: "/Overlay-2.svg"
    },
    {
        title: "Tier classification",
        description: "Four-tier system from seed to stellar ratings",
        image: "/Overlay-3.svg"
    },
  ]

  const getStarted = [
    {
        title: "Submit Your Contract",
        description: "Paste your token contract (Aptos, Solana, ETH, etc.) to start the vetting process"
    },
    {
        title: "Automated analysis",
        description: "Our system checks security, liquidity, wallets, and sentiment."
    },
    {
        title: "Get Listed",
        description: "Get your badge tier, add project info, and go live"
    },
  ]

export default function ListingApplication() {
    const [selectedNetwork, setSelectedNetwork] = useState<string>("aptos");
    const [networkDialogueOpen, setNetworkDialogueOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBannerPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
  
    
  return (
    <div>
      <div className="border border-white/20  rounded-lg mt-[78px] mx-50">
        <div className="flex justify-center items-center gap-3.5 mx-4 border-b border-white/20 pt-3 pb-4">
          <span
            onClick={() => setCurrentStep(1)}
            className={`size-5 rounded-full font-bold text-[10.5px] flex justify-center items-center ${
              currentStep === 1
                ? "text-white bg-white/10"
                : "text-white/30 bg-white/5"
            }`}
          >
            1
          </span>
          <span className="bg-white/30 w-6 h-[1px]"></span>
          <span
            onClick={() => setCurrentStep(2)}
            className={`size-5 rounded-full font-bold text-[10.5px] flex justify-center items-center ${
              currentStep === 2
                ? "text-white bg-white/10"
                : "text-white/30 bg-white/5"
            }`}
          >
            2
          </span>
          <span className="bg-white/30 w-6 h-[1px]"></span>
          <span
            onClick={() => setCurrentStep(3)}
            className={`size-5 rounded-full font-bold text-[10.5px] flex justify-center items-center ${
              currentStep === 3
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
          className={`flex justify-center items-center gap-3 ${
            currentStep !== 1 ? "hidden" : ""
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
          className={`border border-white/20 rounded-lg p-6 my-8 max-w-[534px] mx-auto ${
            currentStep !== 1 ? "mt-4" : ""
          }`}
        >
          {currentStep === 1 && (
            <Step1
              selectedNetwork={selectedNetwork}
              setSelectedNetwork={setSelectedNetwork}
              networkDialogueOpen={networkDialogueOpen}
              setNetworkDialogueOpen={setNetworkDialogueOpen}
              networks={networks}
            />
          )}

          {currentStep === 2 && (
            <Step2
              profilePreview={profilePreview}
              bannerPreview={bannerPreview}
              handleProfilePictureChange={handleProfilePictureChange}
              handleBannerChange={handleBannerChange}
              setCurrentStep={setCurrentStep}
            />
          )}

          {currentStep === 3 && <Step3 />}
        </div>
      </div>

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
