import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
       <Route path="/login" element={<LoginPage />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/aboutus" element={<AboutUsPage />} />
    </Routes>
  );
};

export default App;
