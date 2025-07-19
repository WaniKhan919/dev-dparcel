import React from 'react';
import LogoCarousel from './LogoCarousel';

const TrustedSolutionsSection = () => {
  return (
    <div className="bg-white text-center py-12 px-4">
   
     

      {/* Delivery Solutions */}
      <h3 className="text-2xl font-bold text-[#002b9a] mb-8">Delivery Solutions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* Card 1 */}
        <div className="border border-blue-500 rounded-md p-6 shadow hover:shadow-lg transition">
          <h4 className="bg-blue-600 text-white text-lg font-semibold px-4 py-2 rounded-t">Dashboard</h4>
          <img src="/images/dashboard.png" alt="Dashboard" className="w-full h-40 object-contain my-4" />
          <p className="text-sm mb-4">
            Our dashboard lets businesses easily manage deliveries with intuitive tracking, scheduling, and real-time updates.
          </p>
          <div className="flex gap-2 justify-center">
            <button className="bg-buttonColor text-white px-4 hover:bg-blue-500 py-1 rounded text-sm"  >Sign up</button>
            <button className="text-blue-600 underline text-sm">See Features</button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="border border-blue-500 rounded-md p-6 shadow hover:shadow-lg transition">
          <h4 className="bg-blue-600 text-white text-lg font-semibold px-4 py-2 rounded-t">Platform Partners</h4>
          <img src="/images/platformPartner.png" alt="Platform Partners" className="w-full h-40 object-contain my-4" />
          <p className="text-sm mb-4">
            Recommended for businesses who want to integrate with our existing partner platforms, offering streamlined growth.
          </p>
          <div className="flex gap-2 justify-center">
            <button className="bg-buttonColor text-white hover:bg-blue-500 px-4 py-1 rounded text-sm">Contact Us</button>
            <button className="text-blue-600 underline text-sm">See Integrations</button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="border border-blue-500 rounded-md p-6 shadow hover:shadow-lg transition">
          <h4 className="bg-blue-600 text-white text-lg font-semibold px-4 py-2 rounded-t">Direct API</h4>
          <img src="/images/directApi.png" alt="Direct API" className="w-full h-40 object-contain my-4" />
          <p className="text-sm mb-4">
            For businesses that require a fully customizable delivery solution via powerful API integration.
          </p>
          <div className="flex gap-2 justify-center">
            <button className="bg-buttonColor hover:bg-blue-500 text-white px-4 py-1 rounded text-sm">Contact Us</button>
            <button className="text-blue-600 underline text-sm">See the Docs</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrustedSolutionsSection;
