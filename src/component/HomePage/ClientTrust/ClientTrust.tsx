import React, { Component } from 'react'
import LogoCarousel from '../TrustedSolution/LogoCarousel'

export default class ClientTrust extends Component {
  render() {
    return (
       <div className='bg-[#F3F6FB] text-center py-12 px-4'>
        <h2 className="text-xl md:text-2xl font-semibold mb-12 text-[#002b9a]">
        Over 25,000 Clients Trust DeliveringParcel
      </h2>
      <div className="flex flex-wrap justify-center gap-6 mb-6 ">
        <LogoCarousel/>
      </div>
      </div>
    )
  }
}
