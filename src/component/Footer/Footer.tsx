import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaGlobe } from "react-icons/fa";


export default function Footer() {
  return (
    <footer className="bg-white text-sm text-[#1b1b1b] px-4 md:px-8 lg:px-16 pt-10 pb-6">
      {/* Top Grid Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Logo & Partners */}
        <div className="md:col-span-1">
          <img
            src="/images/dp.svg"
            alt="Eurosender"
            className="w-32 mb-6"
          />

          <p className="text-[11px] text-gray-600 font-semibold mb-1">POWERED BY</p>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <img src="/images/ssl.png" alt="Post" className="h-5" />
            <img src="/images/safep.png" alt="Ergo" className="h-5" />

          </div>

        </div>

        {/* Columns */}
        <div>
          <h3 className="font-semibold mb-3">Company</h3>
          <ul className="space-y-2">
            <li>Home</li>
            <li>
              <a href="/aboutus"  className="text-none no-underline">
                About us
              </a>
            </li>
            <li>Privacy Policy</li>
          </ul>
        </div>


        <div>
          <h3 className="font-semibold mb-3">Product</h3>
          <ul className="space-y-2">
            <li>API integration</li>
            <li>Become a partner</li>
            <li>Become an affiliate</li>
            <li>Business dashboard</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Support</h3>
          <ul className="space-y-2">
            <li>Help centre</li>
            <li>
              <a href="/contact"  className="text-none no-underline">
                Contact us
              </a>
            </li>
            <li>Tracking</li>
            <li>Resource centre</li>
          </ul>
        </div>

        <div className="flex flex-col items-start md:items-end justify-between gap-4">
          {/* Language */}
          <div className="flex items-center gap-2">
            <FaGlobe className="text-lg" />
            <span>EN</span>
          </div>

          {/* Social Icons */}
          <div className="text-right">
            <p className="font-semibold mb-2">Follow us!</p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook">
                <FaFacebookF className="text-blue-600 hover:opacity-80" />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram className="text-blue-600 hover:opacity-80" />
              </a>
              <a href="#" aria-label="LinkedIn">
                <FaLinkedinIn className="text-blue-600 hover:opacity-80" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 mt-10 pt-6 text-xs text-gray-500 text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-3 px-2">
          <p>DELIVERINGPARCEL LTD,
            27 Old Gloucester Street
            London, United Kingdom, WC1N 3AX</p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-end">
            <a href="#" className="hover:underline">Sitemap</a>
            <a href="#" className="hover:underline">Status</a>
            <a href="#" className="hover:underline">Cookie Policy</a>
            <a href="#" className="hover:underline">Terms & Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
