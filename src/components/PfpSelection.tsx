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


const MASCOT_TRAITS = [
  "ARTIST",
  "ARTIST2",
  "ARTIST3",
  "CTO",
  "CTO2",
  "DEGEN",
  "DEGEN2",
  "DEV",
  "EARLYADT.WHALE",
  "HACKER",
  "HACKER2",
  "HACKER3",
  "HODLER",
  "KOL",
  "MOD",
  "MOD2",
  "MOD3",
  "NEWBIE",
  "SHILLER",
  "VISIONARY",
  "VISIONARY2",
  "WHALE",
  "WHALE2",
  "WHALE3",
] as const;

const PfpSelection = () => {
  const [phase, setPhase] = useState<"stacked" | "spread" | "selected">(
    "stacked"
  );
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [cards, setCards] = useState<PFPCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);
  const [revealedMascotTrait, setRevealedMascotTrait] = useState<string | null>(null);

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
    setRevealedMascotTrait(null);
    setIsRevealed(false);
  };

  const handleReveal = () => {
    if (!selectedCardId) return;

    setRevealedMascotTrait((current) => {
      if (current) return current;
      const randomIndex = Math.floor(Math.random() * MASCOT_TRAITS.length);
      return MASCOT_TRAITS[randomIndex];
    });

    // Just transition to reveal the card - no API call needed
    setIsRevealed(false); // Trigger exit animation of placeholder
    setTimeout(() => {
      setIsRevealed(true); // Show mascot reveal with entrance animation
    }, 500); // Matches exit duration
  };

  const handleHarvest = () => {
    if (!selectedCardId) return;
    
    // Just transition to the next phase - no API call needed
    setPhase("stacked");
    setTimeout(() => {
      setPhase("selected");
    }, 900); // Wait for exit animation to finish
  };

  const handleShare = async (platform: string) => {
    if (!savedImageUrl) {
      toast.error('Please wait for the image to be saved first');
      return;
    }

    const shareText = `Check out my new mascot PFP! 🎨`;

    try {
      switch (platform) {
        case 'X':
        case 'Twitter':
          // Twitter/X share URL - note: Twitter doesn't support image sharing via URL
          // Users will need to manually upload the image
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(savedImageUrl)}`;
          window.open(twitterUrl, '_blank', 'width=550,height=420');
          break;

        case 'Reddit':
          // Reddit submit URL - users can paste the image URL
          const redditUrl = `https://reddit.com/submit?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(savedImageUrl)}`;
          window.open(redditUrl, '_blank', 'width=550,height=420');
          break;

        case 'Facebook':
          // Facebook share URL
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(savedImageUrl)}`;
          window.open(facebookUrl, '_blank', 'width=550,height=420');
          break;

        case 'Export Link':
          // Copy image URL to clipboard
          await navigator.clipboard.writeText(savedImageUrl);
          toast.success('Image URL copied to clipboard!');
          break;

        default:
          // Use Web Share API if available (for native sharing)
          if (navigator.share) {
            try {
              await navigator.share({
                title: 'My Mascot PFP',
                text: shareText,
                url: savedImageUrl,
              });
            } catch (shareError) {
              // User cancelled or share failed
              console.log('Share cancelled or failed:', shareError);
            }
          } else {
            // Fallback: copy URL to clipboard
            await navigator.clipboard.writeText(savedImageUrl);
            toast.success('Image URL copied to clipboard!');
          }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share. Please try again.');
    }
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
                    loading="lazy"
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

          {phase === "selected" && selectedCardId && isRevealed && revealedMascotTrait && (
            <motion.div
              key="mascot-reveal"
              initial={{ opacity: 0, y: 200, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 14,
              }}
            >
              <CardReveal 
                selectedCardId={selectedCardId}
                mascotTrait={revealedMascotTrait}
                onImageSaved={(imageUrl) => setSavedImageUrl(imageUrl)}
              />
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
              onClick={() => handleShare(link.name)}
              className="border-[0.4px] border-[#FFFFFF20] social-link-bg  justify-between size-12 rounded-lg"
            >
              <Image loading="lazy" className="size-[25.3px]" height={25.3} width={25.3} src={link.icon} alt={link.name} />
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
