import React from 'react';

const TrustedSolutionsSection = () => {
  return (
    <div className="bg-white text-center py-12 px-4">
      
      {/* Trusted by Clients */}
      <h2 className="text-xl md:text-2xl font-semibold mb-6 text-[#002b9a]">
        Over 25,000 Clients Trust Stuart
      </h2>
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        {/* Replace src with actual logos */}
        {['papajohns', 'coop', 'hermes', 'tesco', 'pasta', 'fc'].map((logo, index) => (
          <img
            key={index}
            src={`/logos/${logo}.png`}
            alt={`${logo} logo`}
            className="h-8 md:h-10 object-contain"
          />
        ))}
      </div>

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
            <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm">Sign up</button>
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
            <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm">Contact Us</button>
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
            <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm">Contact Us</button>
            <button className="text-blue-600 underline text-sm">See the Docs</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrustedSolutionsSection;
