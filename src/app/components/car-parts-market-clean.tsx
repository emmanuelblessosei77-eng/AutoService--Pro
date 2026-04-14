import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './header';
import { Footer } from './footer';

import { HeroSection } from './sections/HeroSection';
import { PartsGrid } from './sections/PartsGrid';
import { parts } from '../data/data';


export function CarPartsMarketPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // minimal placeholder
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection
        title="Premium Car Parts"
        subtitle="Quality Parts for Every Need"
        backgroundImage="https://cdn.pixabay.com/photo/2017/03/13/21/39/car-parts-2142319_1280.jpg"
      />

      <main className="container mx-auto max-w-6xl py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">All Car Parts & Accessories</h2>
        <PartsGrid parts={parts} />
        <div className="text-center mt-12">
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded">Back to Home</button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
