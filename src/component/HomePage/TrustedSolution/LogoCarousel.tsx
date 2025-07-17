import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const LogoCarousel = () => {
  const logos = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className="mb-12 px-4 py-4 w-full max-w-screen-xl mx-auto">

      <Swiper
        modules={[Autoplay]}
        spaceBetween={10}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 4 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 4 },
        }}
        loop={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        className="mySwiper w-full"
      >
        {logos.map((num) => (
          <SwiperSlide key={num} className="flex justify-center items-center h-20">
            <img
              src={`/images/partners/${num}.png`}
              alt={`Partner logo ${num}`}
              className="h-10 object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default LogoCarousel;
