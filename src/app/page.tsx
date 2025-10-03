"use client"

import NavBar from '@/components/homepage/NavBar'
// import PanoraSwapWidget from '@/components/PanoraSwapWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react'

const cardData = [
  {
    title: "Abandoned tokens, Broken promises.",
    description: "Thousands of crypto tokens get abandoned, but strong communities continue to build",
  },
  {
    title: "CTO projects need a home",
    description: "Community Taken Over(CTO) projects are rising. But there's nowhere built for them",
  },
  {
    title: "Viral Launches Steal The Spotlight",
    description: "Hype dies fast. Real value comes from communities bringing tokens back to life",
  },
];


export default function Home() {
  return (
    <main>
    <section className='bg-[url("/orbital.png")] h-[1024px] bg-cover bg-center bg-no-repeat'>
      <div className='flex justify-center mt-12'>
        <NavBar />
      </div>

      <div className='text-center mt-20 flex flex-col items-center justify-center'>
        <h1 className='text-[80px] w-[814px]'>Revive. Rebuild. Rememe</h1>
        <p className='text-lg text-[#FFFFFFCC]'>Explore high-potential CTO (Community Taken Over) crypto projects</p>
      </div>
    </section>
    <section>
      <div className='flex justify-center -mt-64'>
        <Image src="/discovery-hub.png" alt="discovery hub" width={800} height={400} />
      </div>

      <h2 className='text-[40px] font-[600] text-center mb-14 mt-40'><span className='block text-[#FFFFFF80]'>Why the Community</span> Deserves Its Own Market</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 px-25">
      {cardData.map((card, index) => (
        <div
          key={index}
          className="bg-gradient-to-t from-white/40 via-white/10 to-white/5 rounded-3xl p-[1px]"
        >
          <div className="bg-black rounded-3xl h-full p-5 text-white">
            <h3 className="text-2xl mb-2">{card.title}</h3>
            <p className="text-lg text-[#FFFFFFB2]">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
    </section>
    <section className='bg-[url("/landing-page-section-bg.png")] mt-52 mb-[172px] bg-cover bg-center bg-no-repeat flex flex-col justify-between h-[620px] py-[69px]'>
    <div className='flex justify-between items-center mx-25'>
      <div className='text-center'>
        <h4 className='text-[#FF9631] text-[52px] font-bold'>Discover</h4>
        <p className='w-51'>Early memecoins with real community momentum.</p>
      </div>
      <div className='text-center'>
        <h4 className='text-[#FF9631] text-[52px] font-bold'>Connect</h4>
        <p className='w-51'>Devs, designers, mods & raiders. Meet your team.</p>
      </div>
    </div>
    <div className='flex justify-center h-full items-center'><Image src="/cto-gradient-logo.png" alt="cto-gradient-logo" width={400} height={200} /></div>
    <div className='flex justify-between items-center mx-25'>
      <div className='text-center'>
        <h4 className='text-[#FF9631] text-[52px] font-bold'>Build</h4>
        <p className='w-51'>Contribute to revivals, share alpha, help shape success.</p>
      </div>
      <div className='text-center'>
        <h4 className='text-[#FF9631] text-[52px] font-bold'>Trust</h4>
        <p className='w-51'>Listings vetted. Community powered due diligence.</p>
      </div>
    </div>
    </section>
    <section className="bg-black text-white py-16 px-4 text-center">
      <h2 className="text-[76px] font-[600]">Built for Community</h2>
      <p className="text-[#DDDDDD] mb-8">
        Support community led memecoins before the market catches on.
      </p>

      <form className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
        <div className='bg-[#FFFFFF17] rounded-lg relative'>
          <Label className='absolute text-gray-400 text-xs left-4 top-2'>Email Address</Label>
        <Input
          type="email"
          className="bg-transparent text-base border-none h-16 text-white px-4 py-3 rounded-md w-full sm:w-[502px] focus:outline-none"
        />
        </div>
        <Button
          type="submit"
          className="cta-gradient px-6 h-12 py-3 rounded-md font-semibold text-white"
        >
          Join Waitlist
        </Button>
      </form>
    </section>
    <footer className="bg-black text-white px-25 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
            <Image src="/nav-bar/logo.svg" alt="Logo" className="h-12 w-[188px]" width={188} height={51}/>
          </div>
          <p className="text-base text-white mb-3">Where Memecoins go to live again</p>
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
        <p className='teaxt-[#FFFFFF99]'>
          Listing your project? <a href="mailto:partnerships@ctoMarketplace.com" className="underline text-white">partnerships@ctoMarketplace.com</a>
        </p>
      </div>
    </footer>
    {/* <PanoraSwapWidget /> */}
    </main>
  )
}
