import React, { Component } from 'react'
import LogoCarousel from '../TrustedSolution/LogoCarousel'

const carriers = [
  { src: 'images/carrier/DPD.svg', alt: 'dpd', height: 'full', width: 'full' },
  { src: 'images/carrier/GLS.svg', alt: 'gls', height: 'full', width: 'full' },
  { src: 'images/carrier/DHL.svg', alt: 'dhl', height: 'full', width: 'full' },
  { src: 'images/carrier/UPS.svg', alt: 'ups', height: 'full', width: 'full' },
  { src: 'images/carrier/KN.svg', alt: 'kn', width: 16, height: 12 },
];

export default class ClientTrust extends Component {


  render() {
    return (
      <>
        <div className="flex justify-center w-full absolute z-10" style={{ marginTop: -40 }}>
          <div className="flex w-full max-w-[500px] justify-between px-2 ">
            {carriers.map((carrier, index) => (
              <div
                key={index}
                className="
          bg-white overflow-hidden shadow-md rounded-[16px]
          w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] 
          flex items-center justify-center 
          transition-transform hover:scale-105
        "
              >
                <img
                  src={carrier.src}
                  alt={carrier.alt}
                  className={`max-h-${carrier.height} max-w-${carrier.width} object-contain`}
                />
              </div>
            ))}
          </div>
        </div>


        <div className='bg-[#F3F6FB] text-center py-12 px-4 relative'>
          <h2 className="text-xl md:text-2xl font-semibold mb-12 text-[#002b9a] mt-5">
            Over 25,000 Clients Trust DeliveringParcel
          </h2>
          <div className="flex flex-wrap justify-center gap-6 mb-6 ">
            <LogoCarousel />
          </div>
        </div>
      </>
    )
  }
}
