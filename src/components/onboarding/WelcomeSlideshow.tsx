"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

const slides = [
  {
    image: "/welcome-slideshow/default.png",
    title: "Discover Community-Driven Crypto Projects",
    description: "Real-time insights for community-taken-over tokens.",
  },
  {
    image: "/welcome-slideshow/default.png",
    title: "Discover Community-Driven Crypto Projects",
    description: "Real-time insights for community-taken-over tokens.",
  },
  {
    image: "/welcome-slideshow/default.png",
    title: "Discover Community-Driven Crypto Projects",
    description: "Real-time insights for community-taken-over tokens.",
  },
];

export default function WelcomeSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const pathname = usePathname();
  const { login } = usePrivy();

  const isLastSlide = currentIndex === slides.length - 1;

  const handleNext = () => {
    if (!isLastSlide) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // const handleBack = () => {
  //   if (currentIndex > 0) {
  //     setCurrentIndex((prev) => prev - 1);
  //   }
  // };

  useEffect(() => {
    if (pathname === "/" || pathname === "/faq") {
      setShowOnboarding(false);
      return;
    }

    const hasSeenOnboarding = localStorage.getItem("onboardingShown");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
      localStorage.setItem("onboardingShown", "true");
    } else {
      setShowOnboarding(false);
    }
  }, [pathname]);

  // const handleFinish = () => {
  //   console.log("Finished onboarding");
  // };

  if (pathname === "/" || pathname === "/faq" || !showOnboarding) return null;

  return (
    <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
      <DialogContent className="bg-black border-[2px] p-6 border-[#86868630] text-white max-w-5xl overflow-hidden rounded-xl">
        <DialogHeader className="hidden">
          <DialogTitle>Onboarding</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col justify-between w-fit h-full">
          {/* Carousel Display */}
          <div className="relative w-full overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {slides.map((slide, index) => (
                <div key={index} className="min-w-full">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    className="w-full border-[0.5px] rounded-lg border-[#FFFFFF33]"
                    width={800}
                    height={400}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 text-center">
            <h2 className="text-base font-bold">{slides[currentIndex].title}</h2>
            <p className="text-xs text-[#FFFFFF70] font-[400]">{slides[currentIndex].description}</p>

            <div className="flex justify-center mt-8 space-x-2">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? "cta-gradient" : "bg-[#D9D9D929]"
                  }`}
                ></span>
              ))}
            </div>

            <div className="mt-6 flex justify-between border-t-[0.5px] border-[#FFFFFF20] pt-4">
              {/* <Button
                variant="outline"
                className="bg-[#1c1c1c] text-white border-gray-700"
                onClick={handleBack}
                disabled={currentIndex === 0}
              >
                Back
              </Button> */}
              <Image src="/nav-bar/logo.svg" alt="logo" width={131} height={31}/>
              {isLastSlide ? (
                <Button 
                  className='h-[37px] w-[66px] rounded-lg cta-gradient text-base text-white focus-visible:!border-none'
                  onClick={async () => {
                    setShowOnboarding(false);
                    // Small delay to ensure dialog closes before opening Privy
                    setTimeout(() => {
                      login();
                    }, 100);
                  }}
                >
                    Login
                </Button>
              ) : (
                <Button className="cta-gradient text-white" onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
