import React, { useState } from 'react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-50 relative">
      <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="https://www.eurosender.com/favicon-32x32.png" alt="Eurosender" className="h-6 w-6" />
          <span className="text-[#1c1c1c] text-xl font-semibold">eurosender</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-[#1c1c1c]">
          {/* Services */}
          <div className="relative group">
            <button className="hover:text-[#007aff] flex items-center space-x-1">
              <span>Services</span>
              <svg className="w-3 h-3 mt-[1px]" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 7.5l4.5 4.5 4.5-4.5H5.5z"/></svg>
            </button>
            <div className="absolute left-0 top-full mt-2 w-[500px] bg-white border shadow-md hidden group-hover:flex p-4 z-50 space-x-8 text-sm">
              {/* Top Services */}
              <div>
                <div className="text-xs text-gray-500 font-semibold mb-2">TOP SERVICES</div>
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

          <div className="hover:text-[#007aff] cursor-pointer">Features</div>
          <div className="hover:text-[#007aff] cursor-pointer">Resources</div>
          <div className="hover:text-[#007aff] cursor-pointer">Enterprise</div>
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden lg:flex items-center space-x-4 text-sm font-medium">
          <button className="hover:text-[#007aff] text-[#1c1c1c] flex items-center space-x-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 9.25h-1.5v-1.5h1.5v1.5zm0-3h-1.5v-3h1.5v3z"/></svg>
            <span>EN</span>
          </button>
          <a href="#" className="text-[#1c1c1c] hover:underline">Log in</a>
          <a href="#" className="bg-[#ff5c1c] text-white px-4 py-2 rounded hover:bg-[#e74c10] transition">Create account</a>
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
