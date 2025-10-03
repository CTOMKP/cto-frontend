import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Save, X } from "lucide-react";
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import Image from "next/image";

const sharelinks = [
  {
    icon: "/social-icons/reddit.svg",
    name: "Reddit", 
  },
  {
    icon: "/social-icons/facebook-meta.svg",
    name: "Facebook", 
  },
  {
    icon: "/social-icons/x.svg",
    name: "X", 
  },
  {
    icon: "/social-icons/export-link.svg",
    name: "Export Link", 
  }
]

const PfpSelection = () => {
  const [phase, setPhase] = useState<"stacked" | "spread" | "selected">(
    "stacked"
  );
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const cards = [
    { id: 1, img: "/default-card.png" },
    { id: 2, img: "/default-card.png" },
    { id: 3, img: "/default-card.png" },
    { id: 4, img: "/default-card.png" },
    { id: 5, img: "/default-card.png" },
  ];

  // Spread cards on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("spread");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (id: number) => {
    setSelectedCardId(id);
  };

  const handleReveal = () => {
    setIsRevealed(false); // Trigger exit animation of placeholder
    setTimeout(() => {
      setIsRevealed(true); // Show actual image with entrance animation
    }, 500); // Matches exit duration
  };

  const handleHarvest = () => {
    if (!selectedCardId) return;
    setPhase("stacked");
    setTimeout(() => {
      setPhase("selected");
    }, 900); // Wait for exit animation to finish
  };

  return (
    <div>
      <DialogHeader className="flex !flex-row justify-between items-center pb-2 border-b-[0.5px] border-[#FFFFFF20]">
          <div>
            <DialogTitle className="font-bold text-base">{phase === 'selected' ? 'Reveal Traits' : 'Harvest Grape'}</DialogTitle>
            <DialogDescription className="text-xs font-normal">
              {phase === 'selected' ? 'Tap the card to reveal the character traits' : 'Choose a card and harvest the character'}
            </DialogDescription>
          </div>
          <DialogClose>
            <X size={24} />
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col items-center justify-between mt-6 min-h-66 h-fit">
      <div className="relative flex items-center justify-center h-fit w-fit">
        <AnimatePresence>
          {phase !== "selected" &&
            cards.map((card, index) => {
              const total = cards.length;
              const center = (total - 1) / 2;

              const baseAngle = phase === "stacked" ? 10 : 5;
              const baseOffsetX = phase === "stacked" ? -10 : 60;
              const baseOffsetY = phase === "stacked" ? 5 : 5.8;

              const rotation = (index - center) * baseAngle;
              const offsetX = (index - center) * baseOffsetX;
              const offsetY = Math.abs(index - center) * baseOffsetY;
              const zIndex = 50 - Math.abs(index - center);

              const isSelected = selectedCardId === card.id;

              return (
                <motion.div
                  key={card.id}
                  onClick={() => handleSelect(card.id)}
                  className="absolute top-0"
                  style={{
                    transformOrigin: "center bottom",
                    zIndex: isSelected ? 100 : zIndex,
                  }}
                  initial={{
                    opacity: 0,
                    rotateZ: rotation,
                    x: offsetX,
                    y: offsetY + 40,
                    rotateX: -30,
                    scale: 0.85,
                  }}
                  animate={{
                    opacity: 1,
                    rotateZ: rotation,
                    x: offsetX,
                    y: offsetY,
                    rotateX: 0,
                    scale: isSelected ? 1.05 : 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 100,
                    scale: 0.8,
                    transition: { duration: 0.4 },
                  }}
                  transition={{
                    delay: Math.abs(index - center) * 0.08,
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100,
                    damping: 14,
                  }}
                >
                  {/* Gradient border wrapper */}
                  <div
                    className="p-px rounded-[8px]"
                    style={{
                      background:
                        "linear-gradient(to bottom, #FF0075 0%, #FF4A15 50%, #FFCB45 100%)",
                    }}
                  >
                    {/* Inner card */}
                    <div className="w-[108px] h-[171px] cursor-pointer rounded-[8px] bg-[#0D0D0D] shadow-xl flex items-center justify-center">
                      <Image
                        src="/cto-logo-small.png"
                        alt="cto-logo"
                        className="w-[45px] h-[49px] object-contain"
                        width={45}
                        height={49}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {phase === "selected" && selectedCardId && !isRevealed && (
            <motion.div
              key="placeholder-card"
              initial={{ opacity: 0, y: 200, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: 100,
                scale: 0.8,
                transition: { duration: 0.4 },
              }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 14,
              }}
            >
              <div
                className="p-px rounded-[8px] my-10"
                style={{
                  background:
                    "linear-gradient(to bottom, #FF0075 0%, #FF4A15 50%, #FFCB45 100%)",
                }}
              >
                <div onClick={handleReveal} className="w-[173px] h-[274px] rounded-[8px] bg-[#0D0D0D] shadow-xl flex items-center justify-center">
                  <Image
                    src="/cto-logo-small.png"
                    alt="placeholder"
                    className="w-[45px] h-[49px] object-contain"
                    width={45}
                    height={49}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {phase === "selected" && selectedCardId && isRevealed && (
            <motion.div
              key="actual-card"
              initial={{ opacity: 0, y: 200, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 14,
              }}
            >
              {/* <div
                className="p-[2px] rounded-[8px]"
                style={{
                  background:
                    "linear-gradient(to bottom, #FF0075 0%, #FF4A15 50%, #FFCB45 100%)",
                }}
              > */}
                <div className="w-[221px] h-[326px] mt-2 mb-8 rounded-[8px] flex flex-col items-center justify-between">
                  <Image
                    src={cards.find((c) => c.id === selectedCardId)?.img || ""}
                    alt="selected"
                    className="w-[173px] h-[273px] object-contain"
                    width={173}
                    height={273}
                  />
                  <div className="flex items-center gap-2">
                    <Button className="cta-gradient w-26.5 rounded-lg font-medium text-[14px] text-white h-[36px]">Upload pfp</Button>
                    <Button className="rounded-lg w-26.5 border-[0.2px] border-[#FFFFFF20] font-medium text-[14px]  text-[#FFFFFF50]">Save <Save size={13} color="#FFFFFF50" /></Button>
                  </div>
                </div>
              {/* </div> */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isRevealed ? 
      <div>
        <p className="text-center text-xs text-[#FFFFFF50] font-medium mb-4">Share on social:</p>
        <div className="flex items-center gap-7 transition-all duration-300">
        {sharelinks.map((link, index) => (
            <Button
              key={index}
              className="border-[0.4px] border-[#FFFFFF20] social-link-bg  justify-between size-12 rounded-lg"
            >
              <Image className="size-[25.3px]" height={25.3} width={25.3} src={link.icon} alt={link.name} />
            </Button>
        ))}
      </div>
      </div>
      : 
      <Button
        onClick={phase === "selected" ? handleReveal : handleHarvest}
        disabled={!selectedCardId}
        className={`cta-gradient w-full mt-6 transition-all duration-300 ${
          !selectedCardId ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {phase === "selected" ? "Reveal" : "Harvest"}
      </Button>}
    </div>
    </div>
  );
};

export default PfpSelection;
