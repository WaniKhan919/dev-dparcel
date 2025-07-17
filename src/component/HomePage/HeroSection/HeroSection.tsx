import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';



const packageSizes = [
  {
    id: 'extra-small',
    label: 'Extra-small',
    description: 'Fits in an envelope',
    size: '10 x 8 x 10 cm',
    weight: 'Up to 3 kg',
    icon: '👤',
  },
  {
    id: 'small',
    label: 'Small',
    description: 'Fits in a shoe box',
    size: '40 x 20 x 15 cm',
    weight: 'Up to 6 kg',
    icon: '🧍',
  },
  {
    id: 'medium',
    label: 'Medium',
    description: 'Fits in a backpack',
    size: '50 x 30 x 30 cm',
    weight: 'Up to 12 kg',
    icon: '🎒',
  },
  {
    id: 'large',
    label: 'Large',
    description: 'Fits in a large suitcase',
    size: '90 x 65 x 50 cm',
    weight: 'Up to 40 kg',
    icon: '🧳',
  },
  {
    id: 'extra-large',
    label: 'Extra-large',
    description: 'Fits in a large wardrobe',
    size: '100 x 90 x 50 cm',
    weight: 'Up to 70 kg',
    icon: '🚪',
  },
];

type PackageSize = {
  id: string;
  label: string;
  description: string;
  size: string;
  weight: string;
  icon: string;
};

const HeroSection = () => {

  const [selected, setSelected] = useState<PackageSize | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);



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

          <div className="relative">
            <label className="block text-sm font-medium">Package size</label>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1 cursor-pointer flex justify-between items-center"
            >
              <span>{selected ? selected.label : 'Select size'}</span>
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            </div>

            {dropdownOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded shadow-lg">
                {packageSizes.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelected(item);
                      setDropdownOpen(false);
                    }}
                    className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="text-2xl">{item.icon}</div>
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                        <div className="text-xs text-gray-400">{item.size}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">{item.weight}</div>
                  </div>
                ))}
              </div>
            )}
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
