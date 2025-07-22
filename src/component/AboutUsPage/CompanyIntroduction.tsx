import React, { Component } from 'react'

export default class CompanyIntroduction extends Component {
    render() {
        return (
            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-10 max-w-6xl mx-auto">
                {/* Left: Text Section */}
                <div className="md:w-1/2 mb-6 md:mb-0">
                    <h2 className="text-2xl font-semibold mb-4">What is Delivering Parcel?</h2>
                    <p className="text-black text-base">
                        DeliveringParcel is a leading international shopping and shipping forwarder that connects global shoppers with the world’s top markets. Shop online from the USA, UK, Europe, Australia, and Asia, and ship to any country worldwide — quickly, affordably, and reliably.
                        Enjoy free local warehouse addresses in the USA, UK, Spain, and Australia, and experience seamless shop-and-ship from anywhere to everywhere.
                    </p>
                </div>

                {/* Right: Image Section */}
                <div className="md:w-1/2 flex justify-center">
                    <iframe
                        className="w-full h-80 rounded-lg shadow-md"
                        src="https://www.youtube.com/embed/ub3EjKpKA30"
                        title="Company Introduction"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>

        )
    }
}
