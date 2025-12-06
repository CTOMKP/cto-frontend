import NavBar from '@/components/homepage/NavBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const accordionData = [
    {
        title: "What is CTO Marketplace?",
        description: "Right now, all the mindshare is focused on newly launched memecoins. But what about the older projects? CTO Marketplace is the only platform built entirely for community-takenover projects. We give communities a reliable hub to revive abandoned tokens and help investors discover the next big billion-dollar project while reducing the risk of rugs."
    },
    {
        title: "How does CTO Marketplace work?",
        description: "The platform is designed as a journey for both project owners and investors. CTO Leaders get access to all the tools they need to make projects successful, while investors can access the data they need to make informed decisions on which memecoins to support."
    },
    {
        title: "Why focus on abandoned memecoins?",
        description: "Of the 6 million memecoins launched in the past year, only 3% survived. That's 200k to 300k projects still active. Yet there's no dedicated hub where these communities can be found. Instead, holders are scattered across Twitter threads, abandoned Telegram groups, or buried under rugs on Dexscreener. That's why we built this."
    },
    {
        title: "Who can list a token?",
        description: "Projects move through four listing tiers based on factors like age, liquidity, LP locks, audits, community sentiments and risk score. To qualify for a tier, a project must be at least 14 days old."
    },
    {
        title: "How do I buy tokens on CTO Marketplace?",
        description: "We have Panora aggregator integrated into the platform, which makes it easy to buy any coin directly from any chain we support. Just connect your wallet, research the project, and buy through Panora with a few clicks."
    },
    {
        title: "Is CTO Marketplace safe?",
        description: "We include standard rug detection features plus Community Sentiment to give you extra insights into what the majority thinks about projects. However, we can't 100% guarantee that a project is rug proof. You still need to do your own research. What we can offer you is the data you need to help you make that decision."
    },
    {
        title: "What fees does CTO Marketplace charge?",
        description: "CTO Marketplace charges a small listing fee for projects that wish to apply for a vetted spot on the platform. We also offer classified ad listings for teams and individuals looking to promote their services, partnerships, or collaborations. For investors and users, browsing and basic features are completely free. Access to premium tools and insights is available through our upcoming subscription plans.",
    },
    {
        title: "Can abandoned coins really be revived?",
        description: "Yes !,that’s exactly what the CTO movement is about. Many abandoned coins still have active holders, unused liquidity, and untapped potential. Through community takeovers, transparent leadership, and proper vetting, these projects can be revived, rebranded, and rebuilt into something sustainable. CTO Marketplace provides the infrastructure, visibility, and tools needed for communities to take charge and give promising coins a second life."
    },
    {
        title: "How does escrow work?",
        description: "Our escrow system is designed to protect both project teams and service providers. When a deal is made, for example when hiring a developer or designer through a classified ad, the agreed amount is held securely in escrow until both parties confirm that the work has been completed as promised. Funds are only released once both sides approve, ensuring fairness, accountability, and trust across all collaborations on the platform."
    },
]

export default function Faq() {
  return (
    <div>
      <section className='relative bg-[url("/orbital.png")] h-[900px] sm:h-[800px] bg-cover bg-center bg-no-repeat'>
        <div className="flex justify-center mt-12">
          <NavBar />
        </div>
        <Image
          src="/Group 1597882505.png"
          alt="group"
          width={100}
          height={100}
          className="sm:hidden absolute w-full h-[400px] bottom-0 left-0"
        />

        <div className="m-5 mt-20 flex flex-col items-center justify-center">
          <h1 className="text-[40px] text-left sm:text-center text-wrap max-w-[506px] leading-[120%]">
          Got Questions? We&apos;ve Got Answers.
          </h1>
          <p className="text-lg text-left sm:text-center text-[#FFFFFFCC] text-wrap max-w-[606px] mx-auto">
          Here you&apos;ll find everything you need to know about how our platform works,  from listing and trading abandoned memecoins to understanding escrow, fees, and community revival.
          </p>
        </div>
      </section>

      <section className='px-5 sm:px-25 mt-25 sm:mt-40'>
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-16 max-w-7xl mx-auto'>
          <div className='lg:max-w-[436px] lg:flex-shrink-0'>
            <h1 className='text-[35px] sm:text-[40px] leading-[120%]'>Frequently Asked Questions (FAQ)</h1>
            <p className='text-[#FFFFFFCC] text-base mt-3'>Answers to all your questions, quickly and clearly</p>
          </div>
          <div className='flex-1'>
            <Accordion type="single" collapsible className="w-full border-none">
              {accordionData.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className='bg-[#121212] rounded-xl mb-3 border-none  py-5.5 px-6'>
                  <AccordionTrigger className='text-lg sm:text-xl font-medium text-white hover:no-underline p-0'>
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className='text-[#FFFFFFB2] text-base leading-relaxed p-0 pl-8 mt-3 border-none'>
                    {item.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <div className='bg-[radial-gradient(circle_at_center,#FF9631,#F04866)] rounded-[25px] flex gap-7 p-[30px] mx-auto my-25 flex-col sm:flex-row max-w-[867px] justify-between items-center'>
        <div>
            <h3 className='text-lg text-white sm:!text-left text-center'>Still have a question in mind?</h3>
            <p className='text-base text-white/80 mt-2 text-left sm:text-center'>Contact us if you have any other questions.</p>
        </div>

        <Button className='bg-black hover:bg-black text-white px-4 py-2 rounded-full'>Contact us</Button>
      </div>

      <section className="bg-black text-white py-16 px-4 text-center sm:mt-24">
        <h2 className="sm:text-[76px] text-[40px] leading-[120%] text-center font-[600]">
          Built for Community
        </h2>
        <p className="text-[#DDDDDD] mb-8">
          Support community led memecoins before the market catches on.
        </p>

        <form className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
          <div className="bg-[#FFFFFF17] rounded-lg relative">
            <Label className="absolute text-gray-400 text-xs left-4 top-2">
              Email Address
            </Label>
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

      <footer className="bg-black text-white px-5 sm:px-25 py-10">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="flex flex-col sm:justify-center items-center">
            <div className="flex items-center gap-2 mb-12.5 sm:mb-1">
              <Image
                src="/nav-bar/logo.svg"
                alt="Logo"
                className="h-12 w-[188px]"
                width={188}
                height={51}
              />
            </div>
            <p className="text-base sm:text-left text-center text-white mb-3">
              Where Memecoins go to live again
            </p>
            <div className="flex gap-4 text-lg">
              <Link href="#">
                <Image loading="lazy" src="/x-white-bg.png" alt="x" width={24} height={24} />
              </Link>
              <Link href="#">
                <Image
                  loading="lazy"
                  src="/discord-white-bg.png"
                  alt="discord"
                  width={24}
                  height={24}
                />
              </Link>
              <Link href="#">
                <Image
                  loading="lazy"
                  src="/telegram-white-bg.png"
                  alt="telegram"
                  width={24}
                  height={24}
                />
              </Link>
              <Link href="#">
                <Image loading="lazy" src="/medium.png" alt="medium" width={24} height={24} />
              </Link>
              <Link href="#">
                <Image loading="lazy" src="/github.png" alt="github" width={24} height={24} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-800 pt-4 text-base text-[#FFFFFF99] flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2025 CTO Marketplace, Inc.</p>
          <p className="text-[#FFFFFF99] text-center">
            Listing your project?{" "}
            <a href="hello@CTOmarketplace.com" className="underline text-white">
              hello@CTOmarketplace.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
