import React from 'react';
import {
  FaBox,
  FaHandshake,
  FaShippingFast,
  FaPhone,
  FaRocket,
  FaShieldAlt,
  FaShuttleVan,
  FaTruckMoving
} from 'react-icons/fa';

type TimelineItem = {
  icon: JSX.Element;
  title: string;
  desc: string;
};

const timelineDataTop: TimelineItem[] = [
  { icon: <FaBox />, title: 'PACKAGE', desc: 'First order booked in 2014' },
  { icon: <FaHandshake />, title: 'PRO7 SAT1 GROUP', desc: 'Partnered with key investor' },
  { icon: <FaShippingFast />, title: 'PALLET', desc: 'Added a freight shipping option' },
];

const timelineDataBottom: TimelineItem[] = [
  { icon: <FaPhone />, title: 'POST LUXEMBOURG', desc: 'Partnered with key investor' },
  { icon: <FaRocket />, title: 'FIL ROUGE CAPITAL', desc: 'Partnered with key investor' },
  { icon: <FaShieldAlt />, title: 'ERGO VERSICHERUNG', desc: 'Partnered with key investor' },
  { icon: <FaShuttleVan />, title: 'VAN', desc: 'Automatisation of Van service' },
  { icon: <FaTruckMoving />, title: 'TRUCK', desc: 'Instant booking of FTL and LTL' },
];

const Timeline: React.FC = () => {
  return (
    <section className="bg-white py-16 px-6 md:px-12 lg:px-24">
      {/* Section Title */}
      <div className="text-center mb-16">
        <h3 className="text-sm text-blue-600 font-semibold uppercase">Timeline</h3>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">Our story</h2>
      </div>

      {/* Timeline Content */}
      <div className="relative">
        {/* SVG Curve Line */}
        <div className="absolute inset-0 z-0">
          {/* <svg className="w-full h-full" viewBox="0 0 1200 300" fill="none" preserveAspectRatio="none">
            <path
              d="M 0 100 Q 200 0, 400 100 Q 600 200, 800 100 Q 1000 0, 1200 100"
              stroke="#E5E7EB"
              strokeDasharray="5,5"
              strokeWidth="2"
              fill="transparent"
            />
          </svg> */}
        </div>

        {/* Top Row */}
        <div className="flex flex-wrap justify-center gap-y-10 mb-20 relative z-10">
          {timelineDataTop.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center w-1/3 px-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white text-xl mb-2">
                {item.icon}
              </div>
              <h4 className="text-sm font-semibold uppercase text-gray-800">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="flex flex-wrap justify-center gap-y-10 relative z-10">
          {timelineDataBottom.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center w-1/3 px-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white text-xl mb-2">
                {item.icon}
              </div>
              <h4 className="text-sm font-semibold uppercase text-gray-800">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Timeline;
