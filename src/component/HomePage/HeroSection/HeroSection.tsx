import React from 'react';

const HeroSection = () => {
  return (
    <div className="bg-[#002b9a] text-white min-h-screen flex flex-col md:flex-row items-center justify-center px-6 py-12">
      
      {/* Left Content */}
      <div className="md:w-1/2 mb-10 md:mb-0">
        <h1 className="font-inter text-4xl md:text-5xl font-bold mb-4">
          Fast & Cost-Effective <br /> Last-Mile Delivery
        </h1>
        <p className="text-lg mb-6">
          We help businesses get orders to customers with as fast as 30-minute or
          scheduled deliveries, multiple transport options, real-time tracking, and
          prices from £5.50
        </p>
        <div className="flex gap-4 flex-wrap">
          <button className="bg-[#00b3ff] hover:bg-[#009fe3] text-white font-semibold py-2 px-4 rounded">
            Create an Account
          </button>
          <button className="text-white underline hover:text-blue-300">
            Contact Sales
          </button>
        </div>
      </div>

      {/* Right Form */}
      <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full md:w-1/2 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Request a delivery now</h2>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Pick-up address</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 mt-1">
              <option>Select pick-up</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium">Drop-off address</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 mt-1">
              <option>Select drop-off</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium">Package size</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 mt-1">
              <option>Select size</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
              placeholder="Enter your email"
            />
          </div>

          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Estimated pick-up:</span> To be calculated</p>
            <p><span className="font-medium">Total:</span> To be calculated</p>
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="terms" className="mr-2" />
            <label htmlFor="terms" className="text-sm">
              I agree with the <a href="#" className="underline text-blue-600">terms of use</a> and the <a href="#" className="underline text-blue-600">privacy policy</a>
            </label>
          </div>

          <button type="submit" className="bg-[#00b3ff] hover:bg-[#009fe3] text-white w-full py-2 rounded font-semibold">
            Request delivery
          </button>
        </form>
      </div>
    </div>
  );
};

export default HeroSection;
