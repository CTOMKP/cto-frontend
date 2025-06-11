import React from 'react'
import { Button } from './ui/button'

export default function LoginButton() {
  return (
    <div className='mr-5 ml-9'>
      <Button className='h-10 w-20 rounded-4xl cta-gradient text-base text-white'>
        Login
      </Button>
    </div>
  )
}
