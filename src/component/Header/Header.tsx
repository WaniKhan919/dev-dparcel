import React, { useState } from 'react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm relative z-50">
      <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="https://deliveringparcel.com/images/dp.svg" alt=" Delivering Parcel" className="h-7 w-auto" />
          <span className="text-blue-600 text-2xl font-bold"> Delivering Parcel<span className="text-cyan-400">.</span></span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex space-x-6 text-sm font-medium text-blue-800">
          <div className="relative group">
            <button className="hover:text-blue-900">Solutions ▾</button>
          </div>
          <a href="#" className="hover:text-blue-900">Pricing</a>
          <div className="relative group">
            <button className="hover:text-blue-900">Resources ▾</button>
          </div>
          <div className="relative group">
            <button className="hover:text-blue-900">Company ▾</button>
          </div>
          <div className="relative group">
            <button className="hover:text-blue-900">Couriers ▾</button>
          </div>
        </nav>

        {/* Desktop Right-side */}
        <div className="hidden lg:flex items-center space-x-4 text-sm font-medium">
          <button className="text-blue-800 hover:text-blue-900">En ▾</button>
          <a href="#" className="text-blue-800 underline hover:text-blue-900">Log in</a>
          <a href="#" className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600">Create an Account</a>
          <a href="#" className="bg-blue-900 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-950">Contact Sales</a>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-blue-800 focus:outline-none"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}
                   viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}
                   viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-3 text-sm font-medium text-blue-800">
          <a href="#" className="block hover:text-blue-900">Solutions</a>
          <a href="#" className="block hover:text-blue-900">Pricing</a>
          <a href="#" className="block hover:text-blue-900">Resources</a>
          <a href="#" className="block hover:text-blue-900">Company</a>
          <a href="#" className="block hover:text-blue-900">Couriers</a>
          <hr />
          <a href="#" className="block hover:text-blue-900">Log in</a>
          <a href="#" className="block bg-blue-500 text-white px-4 py-2 rounded-md text-center hover:bg-blue-600">Create an Account</a>
          <a href="#" className="block bg-blue-900 text-white px-4 py-2 rounded-md text-center hover:bg-blue-950">Contact Sales</a>
        </div>
      )}

    </header>
  );
};

export default Header;
