// components/CustomerTestimonials.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const testimonials = [
  {
    name: "Shaojie Jay Wu",
    position: "Logistics Operations at Post Luxembourg",
    quote:
      "The price-quality performance provided by Eurosender is one of the best I came across so far.",
    image: "/images/testimonials/testimonials-1.jpg",
    companyLogo: "/images/dp.svg",
  },
  {
    name: "Natureta",
    position: "Marketing Department",
    quote:
      "We were looking for a solution that would handle all of our e-commerce store’s logistics needs in one place.",
    image: "/images/testimonials/testimonials-2.jpg",
    companyLogo: "/images/dp.svg",
  },
  {
    name: "Jan Mihelič",
    position: "Owner of Iron X Wood",
    quote:
      "Ever since we started using Eurosender, all of our logistics operations run really smoothly.",
    image: "/images/testimonials/testimonials-3.jpg",
    companyLogo: "/images/dp.svg",
  },
  {
    name: "John Doe",
    position: "Owner of Revo Company",
    quote:
      "Ever since we started using Eurosender, all of our logistics operations run really smoothly.",
    image: "/images/testimonials/testimonials-4.jpg",
    companyLogo: "/images/dp.svg",
  },
  {
    name: "Ronaldo",
    position: "Owner of Fashion",
    quote:
      "Ever since we started using Eurosender, all of our logistics operations run really smoothly.",
    image: "/images/testimonials/testimonials-5.jpg",
    companyLogo: "/images/dp.svg",
  },
];

const CustomerTestimonials = () => {
  return (
    <section className="bg-[#F7FAFC] py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-14">
          What our customers say
        </h2>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          centeredSlides={true}
          slidesPerView={"auto"}
          loop={true}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          className="px-4"
        >
          {testimonials.map((t, index) => (
            <SwiperSlide
              key={index}
              className="max-w-[320px] sm:max-w-[360px] lg:max-w-[400px] !flex justify-center"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 w-full">
                {/* Top Image */}
                <div className="relative w-full h-64 overflow-hidden">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                  <img
                    src={t.companyLogo}
                    alt="company logo"
                    className="absolute top-4 left-4 w-10 h-10 object-contain bg-white rounded-full p-1 shadow"
                  />
                </div>

                {/* Text Content */}
                <div className="p-6 text-left">
                  <h4 className="text-md font-semibold text-gray-900">
                    {t.name}
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">{t.position}</p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {t.quote}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default CustomerTestimonials;
