import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFound';
import LoginPage from './pages/LoginPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
       <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/about" element={<AboutPage />} /> */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
