// components/HowItWorks.tsx
import React from 'react';

const steps = [
  {
    img: 'https://www.eurosender.com/_assets/home-new/how-it-works-0.svg', // replace with actual image or SVG path
    title: 'Select your pick-up and delivery countries',
  },
  {
    img: 'https://www.eurosender.com/_assets/home-new/how-it-works-1.svg',
    title: 'Choose a service based on the items you are shipping',
  },
  {
    img: 'https://www.eurosender.com/_assets/home-new/how-it-works-2.svg',
    title: 'We choose the best carrier for your preferred shipping option',
  },
  {
    img: 'https://www.eurosender.com/_assets/home-new/how-it-works-3.svg',
    title: 'Add insurance and complete the order with secure payment',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-12 bg-white text-center px-4 md:px-8 lg:px-16">
      <h2 className="text-3xl md:text-4xl font-semibold  mb-12 text-[#002b9a]">How It Works</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-sm md:text-base">
            <img
              src={step.img}
              alt={`Step ${index + 1}`}
              className="w-60 h-60 object-contain mb-4"
            />
            <p className="text-gray-700 leading-snug max-w-xs">{step.title}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <button className="bg-buttonColor hover:bg-blue-700 text-white px-6 py-3 text-sm md:text-base rounded font-medium shadow-md transition">
          Start shipping now
        </button>
      </div>
    </section>
  );
}
