import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 px-5 sm:px-25 py-10">

        <div className="flex flex-col sm:justify-center items-center">
          <div className="flex items-center gap-2 mb-12.5 sm:mb-1">
            <Image src="/nav-bar/logo.svg" alt="Logo" className="h-12 w-[188px]" width={188} height={51}/>
          </div>
          <p className="text-base sm:text-left text-center text-white mb-3">Where Memecoins go to live again</p>
          <div className="flex gap-4 text-lg">
            <Link href='#'><Image src="/x-white-bg.png" alt="x" width={24} height={24} /></Link>
            <Link href='#'><Image src="/telegram-white-bg.png" alt="telegram" width={24} height={24} /></Link>
            <Link href='#'><Image src="/github.png" alt="github" width={24} height={24} /></Link>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-neutral-800 pt-4 text-base text-[#FFFFFF99] hidden sm:flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© 2025 CTO Marketplace, Inc.</p>
        <p className='text-[#FFFFFF99] text-center'>
          Listing your project? <a href="hello@CTOmarketplace.com" className="underline text-white">hello@CTOmarketplace.com</a>
        </p>
      </div>

      <div className='p-5 bg-gradient-to-b from-[#E42575] to-[#FF4A15] text-center sm:hidden'>
        <p>© 2025 CTO Market — Built by the people  |  Powered by smart contracts. No middlemen.</p>
      </div>
    </footer>
  )
}
