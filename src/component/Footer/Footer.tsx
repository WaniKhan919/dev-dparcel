import React from 'react';
import { FaLinkedin, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#00249c] text-white px-6 md:px-16 py-12 text-sm">
      <div className="max-w-7xl mx-auto grid gap-10 md:grid-cols-5">
        {/* Logo and newsletter */}
        <div className="md:col-span-1">
          <div className="mb-4">
            <img src="https://deliveringparcel.com/images/dp.svg" alt="Delivering Parcel logo" className="w-28 mb-4" /> {/* Replace with actual logo path */}
          </div>
          <p className="font-semibold mb-1">Stay Updated</p>
          <p className="mb-4 text-sm">
            Get the latest delivery and business trends straight to your inbox.
          </p>
          <form className="space-y-2">
            <input
              type="email"
              placeholder="Email*"
              className="w-full px-3 py-2 rounded border border-white text-black placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-white text-[#00249c] py-2 font-semibold rounded hover:bg-gray-200 transition"
            >
              Subscribe Now
            </button>
          </form>
          <p className="text-[10px] text-white/70 mt-2">
            By submitting this form, you agree to be contacted by Delivering Parcel in accordance with our Terms of Use and Privacy Policy.
          </p>
        </div>

        {/* Navigation columns */}
        <div>
          <p className="font-semibold mb-2">SOLUTIONS</p>
          <ul className="space-y-2">
            <li className="font-medium">Industries</li>
            <li>Restaurants & Food</li>
            <li>Grocery</li>
            <li>Retail & E-commerce</li>
            <li>Documents & Office</li>
            <li className="font-medium mt-2">PRICING</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold mb-2">RESOURCES</p>
          <ul className="space-y-2">
            <li className="font-medium">Explore</li>
            <li>All Resources</li>
            <li>Case Studies</li>
            <li>Blog</li>
            <li>Newsroom</li>
            <li>Help Center</li>
            <li className="font-medium mt-2">Integration</li>
            <li>Partners</li>
            <li>Become a Partner</li>
            <li>Client Developer Portal</li>
            <li>Quick Start Guide</li>
            <li>API</li>
            <li>Community</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold mb-2">COMPANY</p>
          <ul className="space-y-2">
            <li>About Us</li>
            <li>Life at Delivering Parcel</li>
            <li>Careers</li>
            <li>Sustainability</li>
            <li>Compliance</li>
            <li>DEI</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold mb-2">COURIERS</p>
          <ul className="space-y-2">
            <li>Become a Courier</li>
            <li>Courier Blog</li>
            <li>Help Center</li>
          </ul>
          <div className="mt-6">
            <p className="font-semibold mb-1">Follow Us</p>
            <div className="flex gap-4 mt-1">
              <a href="#" aria-label="LinkedIn" className="hover:text-blue-300">
                <FaLinkedin size={20} />
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-blue-300">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-white/30 mt-12 pt-6 text-xs flex flex-col md:flex-row justify-between items-center text-white/70 gap-4">
        <p>© Copyright DeliveringParcel. All Rights Reserved</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <a href="#" className="hover:text-white">Cookie policy</a>
          <a href="#" className="hover:text-white">Legal Notice</a>
          <a href="#" className="hover:text-white">ISMS Policy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
