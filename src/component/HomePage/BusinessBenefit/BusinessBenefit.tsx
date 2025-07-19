// components/BusinessBenefitsSection.jsx

import React from "react";

const BusinessBenefitsSection = () => {
  return (
    <section className="bg-white py-20 px-4 md:px-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-blue-700 text-3xl font-semibold mb-2">
          Exclusive benefits
        </h2>
        <h3 className="text-3xl md:text-3xl font-bold ">
          For registered businesses
        </h3>
        <span className="inline-block mt-4 px-4 py-1 text-sm bg-[#00D18A] text-white font-medium rounded-full">
         No binding contracts or registration fees
        </span>
      </div>

      {/* Benefits */}
      <div className="space-y-20">
        {/* Benefit 1: Billing */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-[#858d9f] mb-2">
              Billing made simple
            </h4>
            <h5 className="text-2xl font-bold text-blue-900 mb-4">
              Simplify your billing
            </h5>
            <p className="text-gray-600">
              Simplify your accounting processes by enabling a single, comprehensive invoice for
              your purchases.
            </p>
          </div>
          <img
            src="/images/BusniessBenefit/Benefits-0.svg"
            alt="Billing preview"
            className="max-w-md w-full rounded-lg shadow-md"
          />
        </div>

        {/* Benefit 2: Wallet */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          <img
            src="/images/BusniessBenefit/Benefits-1.svg"
            alt="Wallet preview"
            className="max-w-md w-full rounded-lg shadow-md"
          />
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-[#858d9f] mb-2">
              Wallet
            </h4>
            <h5 className="text-2xl font-bold text-blue-900 mb-4">
              Top-up and save more
            </h5>
            <p className="text-gray-600">
              Enable advanced settlement options, or save by paying with store credits. Exclusive user conditions
              and benefits unlock when businesses top up for specific tiers.
            </p>
          </div>
        </div>

        {/* Benefit 3: E-commerce Integration */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-[#858d9f] mb-2">
              E-commerce Integration
            </h4>
            <h5 className="text-2xl font-bold text-blue-900 mb-4">
              Connect your store
            </h5>
            <p className="text-gray-600">
              Automate processes, sync your inventory, and manage shipping labels into your own systems, accelerating
              your shipping process and increasing efficiency.
            </p>
          </div>
          <img
            src="/images/BusniessBenefit/Benefits-2.svg"
            alt="Integration preview"
            className="max-w-md w-full rounded-lg shadow-md"
          />
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center mt-20">
        <button className="bg-orange-600 text-white font-bold py-3 px-6 rounded hover:bg-orange-700 transition">
          Get access to all benefits
        </button>
      </div>
    </section>
  );
};

export default BusinessBenefitsSection;
