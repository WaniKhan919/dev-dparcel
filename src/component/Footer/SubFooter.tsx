import React, { Component } from 'react'

export default class SubFooter extends Component {
  render() {
    return (
      <div className="bg-[#F3F6FB] text-left text-sm text-blue-800  px-4 py-10 w-full">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="font-semibold mb-2 text-black">Worldwide Shipping</h3>
            <ul className="space-y-1">
              <li className="text-black">Europe shipping services</li>
              <li className="text-black">North America shipping services</li>
              <li className="text-black">South America shipping services</li>
              <li className="text-black">Asia shipping services</li>
              <li className="text-black">Africa shipping services</li>
              <li className="text-black">International shipping services</li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold mb-2 text-black">Package and envelope shipping</h3>
            <ul className="space-y-1">
              <li className="text-black">Courier services in Europe</li>
              <li className="text-black">International parcel postage</li>
              <li className="text-black">Shipping luggage internationally</li>
              <li className="text-black">Sending documents abroad</li>
              <li className="text-black">Packing guidelines for different items</li>
              <li className="text-black">Send parcels overseas</li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-semibold mb-2 text-black">Other logistics solutions</h3>
            <ul className="space-y-1">
              <li className="text-black">Custom freight solutions</li>
              <li className="text-black">Dedicated van deliveries</li>
              <li className="text-black">Pallet delivery in Europe</li>
              <li className="text-black">Best courier companies</li>
              <li className="text-black">Parcel collection services</li>
              <li className="text-black">Cheapest parcel delivery</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
}
