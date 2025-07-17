import React from 'react';
import Header from '../component/Header/Header';
import HeroSection from '../component/HomePage/HeroSection/HeroSection';
import TrustedSolutionsSection from '../component/HomePage/TrustedSolution/TrustedSolutionsSection';
import HowItWorks from '../component/HomePage/HeroSection/HowItWork/HowItWork';
import Footer from '../component/Footer/Footer';

const HomePage = () => {
  return (
    <>
      <Header />
      <HeroSection/>
      <TrustedSolutionsSection/>
      <HowItWorks/>
      <Footer/>
    </>
  );
};

export default HomePage;
