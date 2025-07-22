import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import AboutUsPage from './pages/AboutUsPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
       <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/about" element={<AboutPage />} /> */}
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/aboutus" element={<AboutUsPage />} />
    </Routes>
  );
};

export default App;
