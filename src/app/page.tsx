"use client"

import NavBar from '@/components/homepage/NavBar'
// import PanoraSwapWidget from '@/components/PanoraSwapWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const cardData = [
  {
    icon: "/document-text.png",
    title: "Project Listing System",
    description: "Showcases vetted CTO project profiles with transparent details to build investor trust and enhance project visibility.",
  },
  {
    icon: "/star.png",
    title: "Rating and Review System",
    description: "Community-driven feedback tool where users rate/review projects to enhance credibility and identify reliable CTO opportunities.",
  },
  {
    icon: "/messages.png",
    title: "Discussion Forums",
    description: "Interactive project-specific forums foster collaboration and discussion, connecting users with CTO enthusiasts for community engagement.",
  },
  {
    icon: "/shield-security.png",
    title: "Secure Payment Escrow",
    description: "Safe transaction system with escrow to protect investments and partnerships from scams for users and projects.",
  },
  {
    icon: "/favorite-chart.png",
    title: "Analytics Dashboard",
    description: "Tracks project and portfolio performance with metrics to empower users with data-driven insights for smarter investing"
  },
  {
    icon: "/medal-star.png",
    title: "Referral Reward Program",
    description: "Incentivizes engagement and referrals, letting users earn tokens, NFTs, and passive income to boost platform growth.",
  },
];


export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cto-backend-production-28e3.up.railway.app';
      
      const response = await fetch(`${backendUrl}/api/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Thank you for joining our waitlist!');
        setEmail(''); // Clear the input
      } else {
        toast.error(data.message || 'Failed to join waitlist');
      }
    } catch (error) {
      console.error('Waitlist error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
    <section className='relative sm:bg-[url("/orbital.png")] h-[500px] sm:h-[1024px] bg-cover bg-center bg-no-repeat'>
      <div className='flex justify-center mt-12'>
        <NavBar />
      </div>
      <Image src="/Group 1597882505.png" alt="group" width={100} height={100} className='sm:hidden absolute w-full h-[400px] bottom-0 left-0' />

      <div className='text-center m-5 mt-20 flex flex-col items-center justify-center'>
        <h1 className='text-[50px] sm:text-[70px] text-left sm:text-center text-wrap max-w-[606px] mx-auto leading-[120%]'>Revive. Rebuild. Rememe</h1>
        <p className='text-lg text-left md:text-center text-[#FFFFFFCC] text-wrap max-w-[606px] mx-auto'>Discover, explore, and build with high value communities</p>
        <form onSubmit={handleWaitlistSubmit} className="flex justify-center items-center gap-4 max-w-md mx-auto mt-[30px]">
        <div>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Enter your mail'
          disabled={isSubmitting}
          required
          className="bg-[#434343]/80 border border-[#A1A1A1] h-13 placeholder:text-[20px] text-white px-4 py-3 rounded-[30px] w-full sm:w-[502px] focus:outline-none"
        />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-white text-[20px] px-6 h-12 py-4 rounded-[30px] font-semibold text-black disabled:opacity-70"
        >
          {isSubmitting ? 'Joining...' : 'Join Waitlist'}
        </Button>
      </form>
      </div>
    </section>
    <div className='hidden relative z-50 sm:flex justify-center -mt-64'>
        <Image src="/discovery-hub.png" alt="discovery hub" width={800} height={400} className='border-9 border-[#A26754] rounded-[4.54px]' />
      </div>
    <section className='mb-[300px]'>
      <div className='relative px-5 sm:px-0 sm:max-w-[80%] mx-auto bg-center bg-no-repeat bg-contain'>
        <Image src="/line-group.png" alt="line group" width={1024} height={1024} className='absolute px-5 sm:px-0 top-60 sm:top-50 left-0' />
      <div className='max-w-[557px] text-wrap pt-14 sm:pt-[117px]'>
        <h3 className='leading-[140%] text-2xl sm:text-[40px]'>Liquidity In, Liquidity Out. Communities Left Behind.</h3>
        <p className='text-white/80 mt-4 mb-7 sm:mb-[70px]'>Launchpads are built for launches, not longterm growth</p>
        <div className='grid grid-cols-3 gap-4 sm:gap-6'>
          <div>
            <h4 className='text-[#FF9631] font-medium sm:text-[60px] text-[26px] leading-[130%]'>100</h4>
            <p className='text-white text-sm sm:text-[24px]'>Launched</p>
          </div>
          <div>
            <h4 className='text-[#FF9631] font-medium sm:text-[60px] text-[26px] leading-[130%]'>100</h4>
            <p className='text-white text-sm sm:text-[24px]'>Graduated</p>
          </div>
          <div>
            <h4 className='text-[#FF9631] font-medium sm:text-[60px] text-[26px] leading-[130%]'>100</h4>
            <p className='text-white text-sm sm:text-[24px]'>Runners</p>
          </div>
        </div>
      </div>
      </div>
    </section>

    <section>
      <h2 className='text-[24px] max-w-[258px] sm:max-w-none mb-3 mx-auto leading-[120%] sm:text-[40px] text-center'>Why the community deserves its own market</h2>
      <p className='leading-[150%] text-[#D1D1D1] text-center max-w-[831px] mx-auto'>We enable communities mature in DeFi by providing the platform that boost your visibility, empowering communities to grow. Discover driven communities with value and thrive.</p>
      <Image src="/why-img.png" alt="why ctomarkelplace" width={672} height={1280} className='mx-auto w-[90%] hidden sm:block' />
      <Image src="/why-img-mobile.png" alt="why ctomarkelplace" width={350} height={1210} className='mx-auto mt-22 mb-12 block sm:hidden' />
    </section>

    <section className='bg-gradient-to-t sm:bg-gradient-to-b from-[#F04866]/20 to-[#000000]'>
      <h2 className='text-center text-[20px] uppercase pt-[140px] text-[#FF9631]'>Features</h2>
      <p className='text-center text-[24px] sm:text-[40px] mb-20'>An ecosystem built to last long</p>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mx-5 sm:mx-[105px] pb-17 sm:pb-[140px]'>
      {cardData.map((card, index) => (
        <div
          key={index}
          className="bg-gradient-to-t from-white/40 via-white/10 to-white/5 rounded-3xl p-[1px]"
        >
            <div className='bg-black rounded-3xl h-full p-6'>
            <span className='size-[50px] bg-[radial-gradient(circle_at_center,#FF9631,#F04866)] mb-15 rounded-[10px] flex justify-center items-center'><Image src={card.icon} alt={card.title} width={30} height={30} /></span>
            <h3 className='text-[24px] mb-2'>{card.title}</h3>
            <p className='text-[#D1D1D1] text-[16px]'>{card.description}</p>
          </div>
        </div>
      ))}
    </div>
    </section>

    <section className='flex flex-col-reverse sm:flex-row justify-center items-center gap-10 mx-5 sm:mx-[105px] my-16'>
      <div>
        <h3 className='font-semibold text-[42px] mx-w-[663px] mb-6 text-wrap'>Every grape has a role. Together, we build the vine.</h3>
        <Button className='font-medium py-3.5 px-5 cta-gradient'>Join the community</Button>
      </div>
      <Image src="/card-stack.png" alt="cto marketplace cards" width={500} height={500} className='size-[350px] md:size-[400px] sm:size-[500px]' />
    </section>

    <section className='relative overflow-hidden'>
      <div className='bg-[radial-gradient(circle_at_center,#FF9631,#F04866)] pt-[450px] sm:pt-[50px] md:pt-[162px] pl-5 sm:pl-[50px] md:pl-[140px] mx-5 h-[800px]'>
        <h3 className='text-[#222222] font-bold text-[24px] sm:text-[40px] max-w-[564px] text-wrap'>The Revival Hub for Forgotten Communities</h3>
        <p className='text-[#151515] mb-[30px] mt-4 font-medium max-w-[564px] text-wrap'>CTO Marketplace is built for comeback stories, where rugged tokens get revived and communities take charge. No dev? No problem. The community leads her</p>
        <div className='flex gap-1'>
        <Button className='bg-[#222222] text-white rounded-full h-11 w-[114px]'>Get started</Button>
        <Button className='bg-white text-[#222222] rounded-full h-11 w-[114px]'>Learn more</Button>
      </div>
    </div>
      <Image src="/Frame 1618869528.png" alt="cto marketplace" width={600} height={600} className='absolute h-full top-0 right-0 hidden sm:block' />
      <img src="/Frame 1618869547.png" alt="cto marketplace" className='absolute w-full right-0 left-0 -top-10  sm:hidden' />
    </section>
    
    <section className="bg-black text-white py-16 px-4 text-center mt-24">
      <h2 className="sm:text-[76px] text-[40px] leading-[120%] text-center sm:text-left font-[600]">Built for Community</h2>
      <p className="text-[#DDDDDD] mb-8">
        Support community led memecoins before the market catches on.
      </p>

      <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
        <div className='bg-[#FFFFFF17] rounded-lg relative'>
          <Label className='absolute text-gray-400 text-xs left-4 top-2'>Email Address</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={isSubmitting}
          required
          className="bg-transparent text-base border-none h-16 text-white px-4 py-3 rounded-md w-full sm:w-[502px] focus:outline-none"
        />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="cta-gradient px-6 h-12 py-3 rounded-md font-semibold text-white disabled:opacity-70"
        >
          {isSubmitting ? 'Joining...' : 'Join Waitlist'}
        </Button>
      </form>
    </section>
    <footer className="bg-black text-white px-5 sm:px-25 py-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">

        <div className="flex flex-col sm:items-start items-center">
          <div className="flex items-center gap-2 mb-12.5 sm:mb-1">
            <Image src="/nav-bar/logo.svg" alt="Logo" className="h-12 w-[188px]" width={188} height={51}/>
          </div>
          <p className="text-base sm:text-left text-center text-white mb-3">Where Memecoins go to live again</p>
          <div className="flex gap-4 text-lg">
            <Link href='#'><Image src="/x-white-bg.png" alt="x" width={24} height={24} /></Link>
            <Link href='#'><Image src="/discord-white-bg.png" alt="discord" width={24} height={24} /></Link>
            <Link href='#'><Image src="/telegram-white-bg.png" alt="telegram" width={24} height={24} /></Link>
          </div>
        </div>

        <div className="flex gap-12 text-sm text-[#D0D0D0]">
          <div>
            <h4 className="text[22px] mb-7.5">Community</h4>
            <ul className="space-y-1">
              <li><a href="#">Docs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text[22px] mb-7.5">Resources</h4>
            <ul className="space-y-1">
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-neutral-800 pt-4 text-base text-[#FFFFFF99] flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© 2025 CTO Marketplace, Inc.</p>
        <p className='text-[#FFFFFF99] text-center'>
          Listing your project? <a href="mailto:partnerships@ctoMarketplace.com" className="underline text-white">partnerships@ctoMarketplace.com</a>
        </p>
      </div>
    </footer>
    </main>
  )
}
