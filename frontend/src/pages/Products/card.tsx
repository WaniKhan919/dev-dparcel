import React from "react";

const driver = {
  name: "John Doe",
  rating: 4.8,
  rides: 120,
  car: "Toyota Prius",
  time: 5,
  distance: 3.2,
  price: 25,
};

export default function Card() {
  const onAccept = () => alert("Accepted!");
  const onDecline = () => alert("Declined!");

  return (
    <div className="bg-white rounded-3xl p-4 mb-4 mx-4 shadow-md">
      <div className="flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{driver.name.charAt(0)}</span>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm">
              <span>{driver.name}</span>
              <span>⭐ {driver.rating}</span>
              <span className="text-gray-400">({driver.rides} rides)</span>
            </div>
            <div className="text-sm">{driver.car}</div>
          </div>
        </div>

        {/* Right Section */}
        <div className="text-right text-sm font-semibold">
          <div>{driver.time} min</div>
          <div>{driver.distance} km</div>
        </div>
      </div>

      {/* Price */}
      <div className="text-xl font-semibold text-blue-600 mt-4">
        QAR {driver.price}
      </div>

      {/* Buttons */}
      <div className="flex mt-3">
        <button
          onClick={onDecline}
          className="bg-gray-200 w-1/2 py-3 rounded-full mr-2"
        >
          Decline
        </button>
        <button
          onClick={onAccept}
          className="bg-blue-800 w-1/2 py-3 rounded-full ml-2 text-white"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
