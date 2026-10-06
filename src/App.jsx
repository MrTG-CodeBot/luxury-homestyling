import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Collections from './components/Collections';
import Projects from './components/Projects';
import WhyUs from './components/WhyUs';
import FreeMeasurementForm from './components/FreeMeasurementForm';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import Admin from './components/Admin';

function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    const projElem = document.getElementById('projects');
    if (projElem) {
      projElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Collections onSelectCategory={handleSelectCategory} />
        <Projects activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        <WhyUs />
        <FreeMeasurementForm />
        <Reviews />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/ashik" element={<Admin />} />
    </Routes>
  );
}
