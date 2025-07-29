import React, { useState } from 'react';
import { CiGlobe } from "react-icons/ci";
import { FaUserCircle } from "react-icons/fa";
import { TfiHeadphoneAlt } from "react-icons/tfi";
import { IoMdInformationCircleOutline } from "react-icons/io";







interface HeaderProps {
  backgroundColor?: string; // optional
  textcolor?: string;
}

const Header: React.FC<HeaderProps> = ({ backgroundColor = '#ffffff', textcolor = '#00000' }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ backgroundColor }} className="bg-[backgroundColor]  z-50 sticky top-0">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <div className='flex gap-10'>


        {/* Logo */}
        <div className="flex items-center space-x-2">
          <a href='/' target='_blank'className='flex gap-2 items-center'>
          <img src="/images/dp.svg" alt="DeliveringParcel" className="h-6 w-6" />
          
          <span style={{ color: textcolor }} className="text-[#1c1c1c] text-base font-semibold">Delivering Parcel</span>
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-[#1c1c1c]">
          {/* Services */}
          <div className="relative group">
            <button className="hover:text-[#007aff] flex items-center space-x-1">
              <span className='text-base' style={{ color: textcolor }}>Services</span>
              <svg className="w-3 h-3 mt-[1px]" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 7.5l4.5 4.5 4.5-4.5H5.5z" /></svg>
            </button>
            <div className="absolute left-0 top-full mt-2 w-[500px] bg-white border shadow-md hidden group-hover:flex p-4 z-50 space-x-8 text-sm">
              {/* Top Services */}
              <div>
                <div  className="text-xs text-gray-500 font-semibold mb-2">TOP SERVICES</div>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2 hover:underline cursor-pointer">
                    <span>📄 Document</span>
                    <span className="text-red-500 text-xs bg-red-100 px-1 rounded">Express</span>
                  </li>
                  <li className="flex items-center space-x-2 hover:underline cursor-pointer">
                    <span>📦 Package</span>
                    <span className="text-red-500 text-xs bg-red-100 px-1 rounded">Express</span>
                  </li>
                  <li className="hover:underline cursor-pointer">🪵 Pallet</li>
                  <li className="flex items-center space-x-2 hover:underline cursor-pointer">
                    <span>🚐 Van delivery</span>
                    <span className="text-red-500 text-xs bg-red-100 px-1 rounded">Express</span>
                  </li>
                  <li className="hover:underline cursor-pointer">🚚 FTL & LTL</li>
                </ul>
              </div>

              {/* Special Services */}
              <div>
                <div className="text-xs text-gray-500 font-semibold mb-2">SPECIAL SERVICES</div>
                <ul className="space-y-2">
                  <li className="hover:underline cursor-pointer">🏠 Relocation</li>
                  <li className="hover:underline cursor-pointer">🚗 Car transport</li>
                  <li className="hover:underline cursor-pointer">📂 Enterprise solutions</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{ color: textcolor }} className="hover:text-[#007aff] cursor-pointer text-base">Features</div>
          <div style={{ color: textcolor }} className="hover:text-[#007aff] cursor-pointer text-base">Resources</div>
          <div style={{ color: textcolor }} className="hover:text-[#007aff] cursor-pointer text-base">Enterprise</div>
        </nav>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden lg:flex items-center space-x-4 text-sm font-medium">
          
          <a href="/login" style={{ color: textcolor }} className="text-[#1c1c1c] hover:underline flex items-center gap-2">
          <FaUserCircle size={25}/>

          Log in
          </a>
          <a href="/login" style={{ color: textcolor }} className="bg-[#ff5c1c] text-white px-4 py-2 rounded hover:bg-[#e74c10] transition">Create account</a>

<a href="/contact">
          <TfiHeadphoneAlt style={{ color: textcolor }} size={25}/>
          </a>
          <IoMdInformationCircleOutline style={{ color: textcolor }} size={25} />

          <button className="hover:text-[#007aff] text-[#1c1c1c] flex items-center space-x-1">
           <CiGlobe style={{ color: textcolor }}  size={25}/>

            <span style={{ color: textcolor }}>EN</span>

          </button>

          

        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-800 focus:outline-none">
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}
                viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}
                viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="lg:hidden px-6 py-4 space-y-3 bg-white border-t border-gray-100 text-sm text-[#1c1c1c]">
          <div className="hover:text-[#007aff]">Services</div>
          <div className="hover:text-[#007aff]">Features</div>
          <div className="hover:text-[#007aff]">Resources</div>
          <div className="hover:text-[#007aff]">Enterprise</div>
          <hr />
          <div className="hover:underline">Log in</div>
          <a href="#" className="block bg-[#ff5c1c] text-white text-center px-4 py-2 rounded hover:bg-[#e74c10]">Create account</a>
        </div>
      )}
    </header>
  );
};

export default Header;
