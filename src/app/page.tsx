"use client"

import NavBar from '@/components/homepage/NavBar'
// import PanoraSwapWidget from '@/components/PanoraSwapWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Footer from '@/components/homepage/Footer';

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
  const [stats, setStats] = useState({
    dailyTokensDeployed: 10000,
    dailyGraduates: 80,
    topTokensLast7Days: 8,
  });

  // Fetch memecoin stats on component mount and every 30 seconds
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cto-backend-production-28e3.up.railway.app';
        const response = await fetch(`${backendUrl}/api/stats/memecoin`);
        
        if (response.ok) {
          const data = await response.json();
          setStats({
            dailyTokensDeployed: data.dailyTokensDeployed || 10000,
            dailyGraduates: data.dailyGraduates || 80,
            topTokensLast7Days: data.topTokensLast7Days || 8,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Keep fallback values
      }
    };

    fetchStats(); // Initial fetch
    
    // Auto-refresh Dune stats every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

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
        <div className='flex flex-wrap gap-8 sm:gap-16'>
          <div className='flex flex-col'>
            <h4 className='text-[#FF9631] font-medium sm:text-[60px] text-[26px] leading-[130%] whitespace-nowrap'>{stats.dailyTokensDeployed.toLocaleString()}</h4>
            <p className='text-white text-sm sm:text-[24px] mt-2'>Launched</p>
          </div>
          <div className='flex flex-col'>
            <h4 className='text-[#FF9631] font-medium sm:text-[60px] text-[26px] leading-[130%] whitespace-nowrap'>{stats.dailyGraduates.toLocaleString()}</h4>
            <p className='text-white text-sm sm:text-[24px] mt-2'>Graduated</p>
          </div>
          <div className='flex flex-col'>
            <h4 className='text-[#FF9631] font-medium sm:text-[60px] text-[26px] leading-[130%] whitespace-nowrap'>{stats.topTokensLast7Days.toLocaleString()}</h4>
            <p className='text-white text-sm sm:text-[24px] mt-2'>Runners</p>
          </div>
        </div>
      </div>
      </div>
    </section>

    <section>
      <h2 className='text-[24px] max-w-[258px] sm:max-w-none mb-3 mx-auto leading-[120%] sm:text-[40px] text-center'>Why the community deserves its own market</h2>
      <p className='leading-[150%] text-[#D1D1D1] text-center max-w-[831px] mx-auto'>We enable communities mature in DeFi by providing the platform that boost your visibility, empowering communities to grow. Discover driven communities with value and thrive.</p>
      <Image src="/why-img.png" alt="why ctomarkelplace" width={672} height={1280} className='mx-auto w-[90%] hidden sm:block mt-20 mb-25' />
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

    <section className='flex flex-col-reverse sm:flex-row justify-center items-center gap-10 mx-5 sm:mx-[50px] md:mx-[105px] my-16'>
      <div>
        <h3 className='font-semibold text-[42px] mx-w-[663px] mb-6 text-wrap'>Every grape has a role. Together, we build the vine.</h3>
        <Button className='font-medium py-3.5 px-5 cta-gradient rounded-[25px]'>Join the community</Button>
      </div>
      
      <div className="bg-gradient-to-br from-[#FF9631] via-[#F04866] to-[#FF9631] rounded-3xl p-[0.7px]">
        <div className="bg-black rounded-3xl p-2 size-[350px] md:size-[350px] lg:size-[500px] sm:size-[300px]">
          <Image src="/card-stack.png" alt="cto marketplace cards" width={478} height={235} className='rounded-2xl' />
        </div>
      </div>
    </section>

    <section className='relative sm:overflow-hidden'>
      <div className='bg-[radial-gradient(circle_at_center,#FF9631,#F04866)] sm:ml-16 sm:mt-16 sm:mb-16 pl-5 sm:pl-[20px] md:pl-[100px] mx-5 h-fit pb-22 sm:pb-0 sm:h-[592px]'>
        <div className='flex pt-140 sm:pt-0 flex-col w-full  justify-center h-full'>
        <h3 className='text-[#222222] font-bold text-[24px] sm:text-[40px] sm:w-[250px] md:w-[300px] lg:w-full max-w-[564px] text-wrap'>The Revival Hub for Forgotten Communities</h3>
        <p className='text-[#151515] mb-[30px] mt-4 font-medium max-w-[564px] sm:w-[250px] md:w-[300px] lg:w-full text-wrap'>CTO Marketplace is built for comeback stories, where rugged tokens get revived and communities take charge. No dev? No problem. The community leads her</p>
        <div className='flex gap-1'>
        <Button className='bg-[#222222] text-white rounded-full h-11 w-[114px]'>Get started</Button>
        <Button className='bg-white text-[#222222] rounded-full h-11 w-[114px]'>Learn more</Button>
      </div>
    </div>
      </div>
      <Image src="/Frame 1618869528.png" alt="cto marketplace" width={600} height={600} className='absolute h-full ml-16 top-0 right-0 hidden sm:block' />
      <Image src="/cta-mobile bg v1.png" alt="cto marketplace" width={300} height={300} className='absolute w-full right-0 left-0  -top-10  sm:hidden' />
    </section>
    
    <section className="bg-black text-white py-16 px-4 text-center mt-24">
      <h2 className="sm:text-[76px] text-[40px] leading-[120%] text-center font-[600]">Built for Community</h2>
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
    <Footer />
    </main>
  )
}
