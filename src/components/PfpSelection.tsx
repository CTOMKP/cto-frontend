import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import Image from "next/image";
import { pfpService, PFPCard } from "@/services/pfpService";
import { toast } from "react-toastify";
import { CardReveal } from "./pfp/CardReveal";
import { MoonLoader } from "react-spinners";

const PfpSelection = () => {
  const [phase, setPhase] = useState<"stacked" | "spread" | "selected">(
    "stacked"
  );
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [cards, setCards] = useState<PFPCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cards on mount
  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true);
      try {
        const fetchedCards = await pfpService.getCards();
        setCards(fetchedCards);
      } catch (error) {
        console.error('Failed to fetch cards:', error);
        toast.error('Failed to load cards');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, []);

  // Spread cards after they're loaded
  useEffect(() => {
    if (cards.length > 0) {
      const timer = setTimeout(() => {
        setPhase("spread");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cards]);

  const handleSelect = (id: number) => {
    setSelectedCardId(id);
  };

  const handleHarvest = () => {
    if (!selectedCardId) return;
    
    // Transition to selected phase to show CardReveal
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
        {isLoading && cards.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <MoonLoader color="#FFFFFF" size={24} />
          </div>
        ) : (
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
                        loading="lazy"
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
        )}

        <AnimatePresence mode="wait">
          {phase === "selected" && selectedCardId && (
            <motion.div
              key="mascot-reveal"
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
              <CardReveal onClose={() => setPhase("spread")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase !== "selected" && (
        <Button
          onClick={handleHarvest}
          disabled={!selectedCardId}
          className={`cta-gradient w-full mt-6 transition-all duration-300 ${
            !selectedCardId ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Harvest
        </Button>
      )}
    </div>
    </div>
  );
};

export default PfpSelection;
