import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // Required Swiper styles

const logos = ['papajohns', 'coop', 'hermes', 'tesco', 'pasta', 'fc'];

const LogoCarousel = () => {
  return (
    <div className="mb-12 px-4">
      <Swiper
        spaceBetween={30}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
        }}
        loop={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        className="mySwiper"
      >
        {logos.map((logo, index) => (
          <SwiperSlide key={index}>
            <img
              src={`/logos/${logo}.png`}
              alt={`${logo} logo`}
              className="h-8 md:h-10 object-contain mx-auto"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default LogoCarousel;
