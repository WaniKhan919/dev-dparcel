import React, { useState } from "react";

interface Driver {
  id: number;
  name: string;
  rating: number;
  rides: number;
  car: string;
  time: number;
  distance: number;
  price: number;
}

interface CardToastProps {
  notiffications: Driver[];
}

export default function CardToast({ notiffications }: CardToastProps) {
  const [visibleIds, setVisibleIds] = useState<number[]>(notiffications.map(d => d.id));

  const handleAccept = (id: number) => {
    alert(`Driver ${id} Accepted!`);
    setVisibleIds(prev => prev.filter(d => d !== id));
  };

  const handleDecline = (id: number) => {
    alert(`Driver ${id} Declined!`);
    setVisibleIds(prev => prev.filter(d => d !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100000] flex flex-col gap-3 max-h-[100vh] overflow-y-auto scroll-hidden">
      {notiffications
        .filter(notification => visibleIds.includes(notification.id))
        .map((notification,index) => (
          <div
            key={notification.id}
            className="w-80 bg-white rounded-3xl p-4 shadow-lg animate-slide-up animate-toast-pop"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="flex justify-between items-center">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {notification.name.charAt(0)}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{notification.name}</span>
                    <span>⭐ {notification.rating}</span>
                    <span className="text-gray-400">({notification.rides} rides)</span>
                  </div>
                  <div className="text-sm">{notification.car}</div>
                </div>
              </div>

              {/* Right Section */}
              <div className="text-right text-sm font-semibold">
                <div>{notification.time} min</div>
                <div>{notification.distance} km</div>
              </div>
            </div>

            {/* Price */}
            <div className="text-xl font-semibold text-blue-600 mt-4">
              QAR {notification.price}
            </div>

            {/* Buttons */}
            <div className="flex mt-3">
              <button
                onClick={() => handleDecline(notification.id)}
                className="bg-gray-200 w-1/2 py-3 rounded-full mr-2"
              >
                Decline
              </button>
              <button
                onClick={() => handleAccept(notification.id)}
                style={{
                  backgroundImage: "linear-gradient(180deg, #003bff 25%, #0061ff 100%)",
                }}
                className="w-1/2 py-3 rounded-full ml-2 text-white font-medium shadow-md"
              >
                Accept
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
