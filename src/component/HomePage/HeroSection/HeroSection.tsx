import React, { useState } from 'react';
import countries from '../../../utils/data/countries.json'; // adjust path if needed


const HeroSection = () => {

  const [selected, setSelected] = useState('');
  const [deliveryCountry, setDeliveryCountry] = useState("");


  return (
    <div className="w-full flex flex-col justify-center items-center bg-gradient-to-b from-[#2f7cf4] to-[#6ea8fd] py-10 px-0 pb-24">

      <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-8">
        Save on worldwide shipping with<br />Eurosender
      </h1>
      <div className="mx-4 bg-white rounded-md shadow-md w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Pick-up */}
        <div className="border-b md:border-b-0 md:border-r px-4 py-3 col-span-1 md:col-span-2">
          <label className="block text-base font-medium text-black mb-1">Pick-up</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className={`w-full text-sm focus:outline-none bg-white rounded px-3 py-2 ${selected === '' ? 'text-gray-400' : 'text-black'
              }`}
          >
            <option value="" disabled hidden>
              Select a country
            </option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Delivery */}
        <div className=" border-b md:border-b-0 md:border-r px-4 py-3 col-span-1 md:col-span-2">
          <label className="block text-base font-medium text-black mb-1">Delivery</label>
          <select
            value={deliveryCountry}
            onChange={(e) => setDeliveryCountry(e.target.value)}
            className={`w-full text-sm focus:outline-none bg-white rounded px-3 py-2 ${selected === '' ? 'text-gray-400' : 'text-black'
              }`}
          >
            <option value="" disabled hidden>
              Select a country
            </option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Service */}
        <div className="border-b md:border-b-0 md:border-r px-4 py-3 relative col-span-1 md:col-span-2">
          <label className="block text-base font-medium text-black mb-1">Service</label>
          <select className="w-full text-sm placeholder-gray-400 focus:outline-none">
            <option>Select a service</option>
          </select>
        </div>

        {/* Ordering As */}
        <div className="border-b md:border-b-0 md:border-r px-4 py-3 col-span-1 md:col-span-3">
          <label className="block text-base font-medium text-black mb-1">Ordering as</label>
          <div className="flex items-center space-x-3 text-sm">
            <label className="flex items-center">
              <input
                type="radio"
                name="ordering"
                defaultChecked
                className="mr-1 text-blue-600 focus:ring-0"
              />
              <span className="text-blue-600 text-base font-medium">Individual</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="ordering" className="mr-1 text-blue-600 focus:ring-0" />
              <span className="text-gray-700 text-base">Business</span>
              <span className="ml-1 text-gray-400 text-xs">ℹ️</span>
            </label>
          </div>
        </div>

        {/* CTA Button */}
        <div className="bg-[#0070f3] text-white flex justify-center items-center text-base font-medium cursor-pointer px-4 py-4 md:py-2 hover:opacity-90 transition duration-200 col-span-1 md:col-span-3">
          Prices from €2.99 🔍
        </div>
      </div>



      {/* Badges */}

      <div className="flex flex-wrap justify-center gap-4 mt-10">
        <span className="bg-[#1D73FF] px-4 py-2 rounded-full text-sm flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z" />
          </svg>
          <span className='text-white text-base font-semibold'>Easy ordering</span>
        </span>
        <span className="bg-[#1D73FF] px-4 py-2 rounded-full text-sm flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z" />
          </svg>
          <span className='text-white text-base font-semibold'>Trusted carriers</span>
        </span>
        <span className="bg-[#1D73FF] px-4 py-2 rounded-full text-sm flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z" />
          </svg>
          <span className='text-white text-base font-semibold'>Secure payment</span>
        </span>
      </div>
    </div>
  );
};

export default HeroSection;
