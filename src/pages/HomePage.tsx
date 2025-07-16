import React from 'react';
import Header from '../component/Header/Header';
import HeroSection from '../component/HomePage/HeroSection/HeroSection';
import TrustedSolutionsSection from '../component/HomePage/TrustedSolution/TrustedSolutionsSection';

const HomePage = () => {
  return (
    <>
      <Header />
      <HeroSection/>
      <TrustedSolutionsSection/>
    </>
  );
};

export default HomePage;
