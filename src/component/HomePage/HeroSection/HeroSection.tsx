import React from 'react';

const HeroSection = () => {
  return (
    <div className="w-full flex flex-col justify-center items-center bg-gradient-to-b from-[#2f7cf4] to-[#6ea8fd] py-10 px-4">

      <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-8">
        Save on worldwide shipping with<br />Eurosender
      </h1>

      <div className="bg-white rounded-md shadow-md w-full max-w-6xl grid grid-cols-12 overflow-hidden">
        {/* Pick-up */}
        <div className="col-span-2 border-r px-4 py-3">
          <label className="block text-base font-medium text-black mb-1">Pick-up</label>
          <input
            type="text"
            placeholder="Search country"
            className="w-full text-sm placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Delivery */}
        <div className="col-span-2 border-r px-4 py-3 bg-[#f3f6fb]">
          <label className="block text-base font-medium text-black mb-1">Delivery</label>
          <input
            type="text"
            placeholder="Search country"
            className="w-full text-sm bg-[#f3f6fb] placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Service */}
        <div className="col-span-2 border-r px-4 py-3 relative">
          <label className="block text-base font-medium text-black mb-1">Service</label>
          <select className="w-full text-sm placeholder-gray-400 focus:outline-none">
            <option>Select a service</option>
          </select>
        </div>

        {/* Ordering As */}
        <div className="col-span-3 border-r px-4 py-3">
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
        <div className="col-span-3 bg-[#0070f3] text-white flex justify-center items-center text-base font-medium cursor-pointer px-4 py-2 hover:opacity-90 transition duration-200">
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
