import React from 'react';
import { FaUserTie, FaMousePointer, FaHeadset, FaUser } from 'react-icons/fa';

const StatsSection: React.FC = () => {
    const stats = [
        {
            icon: <FaUserTie size={24} />,
            value: '636604',
            label: 'Registered users',
        },
        {
            icon: <FaMousePointer size={24} />,
            value: '1M+',
            label: 'Monthly website visits',
        },
        {
            icon: <FaHeadset size={24} />,
            value: '17',
            label: 'Support languages',
        },
        {
            icon: <FaUser size={24} />,
            value: '110+',
            label: 'Team members',
        },
    ];

    return (
        <section className="bg-gray-50 text-center pt-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">DeliveringParcel in numbers</h2>

            <div className="flex flex-wrap justify-center gap-10 mb-10">
                {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className="text-gray-500 mb-1">{stat.icon}</div>
                        <div className="text-blue-600 font-bold text-xl">{stat.value}</div>
                        <div className="text-sm text-gray-700 font-medium">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition">
        Read about Our mission <span className="ml-2">→</span>
      </button> */}

            <div className="bg-gray-800 text-gray-300 text-sm mt-16 py-6 px-4 w-full">
                DELIVERINGPARCEL LTD,
                27 Old Gloucester Street
                London, United Kingdom, WC1N 3AX<br/>COMPANY NO. 12657292
            </div>
        </section>
    );
};

export default StatsSection;
