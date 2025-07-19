import React from 'react';
import Header from '../component/Header/Header';
import HeroSection from '../component/HomePage/HeroSection/HeroSection';
import TrustedSolutionsSection from '../component/HomePage/TrustedSolution/TrustedSolutionsSection';
import HowItWorks from '../component/HomePage/HeroSection/HowItWork/HowItWork';
import Footer from '../component/Footer/Footer';
import ClientTrust from '../component/HomePage/ClientTrust/ClientTrust';
import BusinessBenefitsSection from '../component/HomePage/BusinessBenefit/BusinessBenefit';
import CustomerTestimonials from '../component/HomePage/Testimonials/Testimonials';

const HomePage = () => {
  return (
    <>
      <Header />
      <HeroSection/>
      <ClientTrust/>
      {/* <TrustedSolutionsSection/> */}
      <HowItWorks/>
      <BusinessBenefitsSection/>
      <CustomerTestimonials/>
      <Footer/>
    </>
  );
};

export default HomePage;
