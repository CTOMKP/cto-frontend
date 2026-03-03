"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Heart,
  MoreHorizontal,
  Share2,
  Send,
  Smile,
  ImageIcon,
  AtSign,
  ShieldCheck,
  Timer,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CAROUSEL_IMAGES = ["/space-thumbnail.png", "/space-thumbnail.png", "/space-thumbnail.png"];

const RECENT_HISTORY = [
  { id: "1", title: "Meme Artist for Gui", status: "Completed" },
  { id: "2", title: "Community Manager Needed", status: "Completed" },
  { id: "3", title: "Solidity Dev for Launch", status: "Completed" },
];

const MOCK_COMMENTS = [
  { id: "1", username: "Kikau.api", time: "2 hours ago", text: "Is this role still open? Would love to connect.", replies: 2093 },
  { id: "2", username: "Zamani.apt", time: "5 hours ago", text: "We have a similar project on Aptos. DM me.", replies: 0 },
];

export default function MarketplaceAdDetail({ adId }: { adId: string }) {
  const router = useRouter();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!adId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center gap-2">
        <p className="text-white/70">Invalid ad.</p>
        <Button asChild variant="link" className="text-white">
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  const goPrev = () => setCarouselIndex((i) => (i === 0 ? CAROUSEL_IMAGES.length - 1 : i - 1));
  const goNext = () => setCarouselIndex((i) => (i === CAROUSEL_IMAGES.length - 1 ? 0 : i + 1));

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Button variant="ghost" className="text-white/80 hover:text-white mb-6 -ml-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
          <div className="lg:col-span-6 space-y-3">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5">
              <Image src={CAROUSEL_IMAGES[carouselIndex]} alt="Ad" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              <button type="button" onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white" aria-label="Previous image">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white" aria-label="Next image">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div className="flex gap-2">
              {CAROUSEL_IMAGES.map((_, i) => (
                <button key={i} type="button" onClick={() => setCarouselIndex(i)} className={`relative aspect-square w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === carouselIndex ? "border-white/60" : "border-transparent opacity-70"}`}>
                  <Image src={CAROUSEL_IMAGES[i]} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4 border border-[#86868630] rounded-lg p-4">
            <div className="flex relative items-center justify-end gap-3 mb-6">
              <div className="absolute -top-2 -left-2 flex border-[0.5px] border-white/20 rounded-br-lg rounded-tl-lg items-center gap-1 bg-[#FFCB450A] px-2 py-1 text-xs text-[#FFCB45B2]">
                <Clock className="h-3.5 w-3.5" />
                <span>10d: 28m: 34s</span>
              </div>
              <button type="button" className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white" aria-label="Share"><Share2 className="h-5 w-5" /></button>
              <button type="button" onClick={() => setLiked(!liked)} className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white" aria-label="Save">
                <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>
            <div className="bg-[#FFFFFF]/3 p-6 border border-[#FFFFFF]/8 rounded-lg">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">CTO Wanted for Aptos Revival Project <sup className="text-[#FFFFFF80] text-xs">2d</sup></h1>
                <Image src="/listings-chains/aptos.png" alt="aptos" width={24} height={24} className="rounded-full" />
              </div>
              <p className="text-white/70 mt-2">by @Doyecodes</p>
              <div className="flex flex-wrap gap-0.5 mt-2">
                {["Solana", "Urgent", "CTO", "Revvenue share"].map((tag) => (
                  <span key={tag} className="bg-[#131313]/86 p-2 text-xs text-white rounded-[3px]">#{tag}</span>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-6 border border-[#FFFFFF]/8 rounded-lg">
              <p className="text-white/80 text-sm leading-relaxed">Bagzilla Inu launched 3 days ago on Aptos and quickly gained traction, but the developer disappeared after the first pump. No multisig, no roadmap, no follow-up. But the community stayed. Over 60 holders regrouped in Telegram, rebranded the Twitter, and began rallying for a second chance. We&apos;re not here to move on, we&apos;re here to rebuild.</p>
              <div className="flex flex-col gap-2">
                <a href="https://x.com/ikachukwu9" target="_blank" rel="noopener noreferrer" className="inline-flex justify-center text-center bg-[#0FFFBB0D] rounded-[4px] p-2.5 items-center w-full gap-1.5 text-sm text-white/80 hover:text-white hover:underline">
                  <ExternalLink className="h-4 w-4 shrink-0" /> x.com/ikachukwu9
                </a>
                <a href="https://bazillainu.com" target="_blank" rel="noopener noreferrer" className="inline-flex text-center justify-center w-full bg-[#0FFFBB0D] rounded-[4px] p-2.5 items-center gap-1.5 text-sm text-white/80 hover:text-white hover:underline">
                  <ExternalLink className="h-4 w-4 shrink-0" /> Bazillainu.com
                </a>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="bg-white/10 text-white border border-white/20 hover:bg-white/20">CTO Wanted</Button>
                <Button variant="ghost" className="bg-white/10 text-white border border-white/20 hover:bg-white/20">Designer</Button>
              </div>
            </div>

            <div className="p-6 space-y-6 border border-[#FFFFFF]/8 rounded-lg">
              <h2 className="text-lg font-semibold text-white mb-2">What we&apos;re looking for</h2>
              <ul className="list-disc list-inside text-white/80 text-sm space-y-1">
                <li>Smart contract dev (Solidity + Move preferred)</li>
                <li>Basic UI/UX skills a bonus</li>
                <li>Long-term alignment with community</li>
              </ul>
            </div>

            <div className="border border-white/10 p-4 rounded-lg">
              <div className="grid grid-cols-2 text-sm bg-[#060708] rounded-xl">
                <div className="text-center space-y-2 border-[#191B1F] border-r border-b p-5"><p className="text-white/50 mb-0.5">Role type</p><p className="text-white">Designer</p></div>
                <div className="text-center space-y-2 border-b border-[#191B1F] p-5"><p className="text-white/50 mb-0.5">Skill</p><p className="text-white">html/css/javascript</p></div>
                <div className="text-center space-y-2 border-r border-[#191B1F] p-5"><p className="text-white/50 mb-0.5">Price</p><p className="text-white">10,000 USDC</p></div>
                <div className="text-center space-y-2 p-5"><p className="text-white/50 mb-0.5">Payment Type</p><p className="text-white inline-flex items-center gap-1">USDC <ShieldCheck size={16} className="text-emerald-500" /></p></div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#86868630]">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setSaved(!saved)}>{saved ? "Saved" : "Save to watchlist"}</Button>
              <Button className="cta-gradient ml-auto gap-2"><Send className="h-4 w-4" /> Send a message (8 Points)</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 border border-[#86868630] rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Recent history</h2>
            <div className="space-y-2">
              {RECENT_HISTORY.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
                  <span className="text-white/90 text-[24px] font-bold">{item.title}</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-400">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6 border border-[#86868630] rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">12 Comments</h2>
            <div className="space-y-4 mb-6">
              {MOCK_COMMENTS.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 text-sm text-white/70 mb-1">
                      <span className="text-white font-medium">{c.username}</span>
                      <span className="flex items-center gap-1"><Timer size={16} className="text-white/70" />{c.time}</span>
                    </div>
                    <p className="text-white/90 text-sm mb-2">{c.text}</p>
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      {c.replies > 0 && <button type="button" className="hover:text-white/80">{c.replies.toLocaleString()} Replies</button>}
                      <span className="flex items-center gap-1 py-1 px-2 rounded-[24px] bg-[#595959]"><MoveUp size={12} color="#16C784"/>290</span>
                      <span className="flex items-center gap-1 py-1 px-2 rounded-[24px] bg-[#595959]"><MoveDown size={12} color="#FF0000"/>265</span>
                      <button type="button" className="hover:text-white/80">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-[#242424] px-3 py-2">
              <button type="button" className="size-12 text-[#CBCBCB] flex justify-center items-center rounded-full border border-[#333333] hover:text-white" aria-label="Emoji"><Smile className="h-5 w-5" /></button>
              <button type="button" className="size-12 flex justify-center items-center rounded-full border border-[#333333] text-[#CBCBCB] hover:text-white" aria-label="Attach image"><ImageIcon className="h-5 w-5" /></button>
              <button type="button" className="size-12 flex justify-center items-center rounded-full border border-[#333333] text-[#CBCBCB] hover:text-white" aria-label="Mention"><AtSign className="h-5 w-5" /></button>
              <Input placeholder="Ask something about this opportunity..." className="flex-1 border-0 bg-[#1C1C1C] rounded-[30px] h-12 text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0" />
              <button type="button" className="p-2 size-12 rounded-full flex justify-center items-center text-white/70 cta-gradient hover:text-white" aria-label="Send"><Send className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
