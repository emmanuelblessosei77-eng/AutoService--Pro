import React, { useState } from 'react';
import BrandLogo from './BrandLogo';

type AnimationType = 'pulse' | 'float' | 'rotate' | 'gradient' | 'bounce' | 'none';

const animations: { type: AnimationType; label: string; description: string }[] = [
  { 
    type: 'float', 
    label: '✨ Floating', 
    description: 'Smooth levitation effect - elegant and modern' 
  },
  { 
    type: 'pulse', 
    label: '💫 Pulse', 
    description: 'Breathing effect - soft and calm' 
  },
  { 
    type: 'bounce', 
    label: '🎾 Bounce', 
    description: 'Playful bouncing - energetic and fun' 
  },
  { 
    type: 'rotate', 
    label: '⚙️ Rotate', 
    description: 'Classic spinning gear - technical feel' 
  },
  { 
    type: 'gradient', 
    label: '🌈 Gradient', 
    description: 'Color/brightness shift - vibrant effect' 
  },
  { 
    type: 'none', 
    label: '🎨 Static', 
    description: 'No animation - clean and minimal' 
  },
];

export function BrandLogoPreview() {
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType>('float');
  const [isAnimating, setIsAnimating] = useState(true);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">AutoService Pro Logo</h1>
        <p className="text-gray-600">Modern Animation Preview</p>
      </div>

      {/* Main Preview */}
      <div className="bg-white rounded-xl shadow-lg p-12 mb-8 flex flex-col items-center justify-center min-h-96">
        <div className="relative">
          <BrandLogo 
            size={200} 
            animate={isAnimating}
            darkMode={false}
          />
        </div>
        
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {animations.find(a => a.type === selectedAnimation)?.label}
          </h2>
          <p className="text-gray-600 mt-2">
            {animations.find(a => a.type === selectedAnimation)?.description}
          </p>
        </div>
      </div>

      {/* Animation Toggle */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            isAnimating
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-300 text-gray-700'
          }`}
        >
          {isAnimating ? '⏸ Stop Animation' : '▶ Start Animation'}
        </button>
      </div>

      {/* Animation Options Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {animations.map((anim) => (
          <button
            key={anim.type}
            onClick={() => setSelectedAnimation(anim.type)}
            className={`p-4 rounded-lg transition-all border-2 ${
              selectedAnimation === anim.type
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                : 'bg-white text-gray-900 border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="font-semibold text-sm">{anim.label}</div>
            <div className="text-xs mt-1 opacity-75">{anim.type}</div>
          </button>
        ))}
      </div>

      {/* Usage Instructions */}
      <div className="mt-12 p-4 md:p-6 bg-blue-50 border-l-4 border-blue-600 rounded">
        <h3 className="font-bold text-gray-900 mb-3">How to use in your app:</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`<BrandLogo 
  size={100} 
  animate={true}
  animationType="${selectedAnimation}"
  darkMode={false}
/>`}
        </pre>
        <p className="text-sm text-gray-700 mt-3">
          Available types: <code className="bg-white px-2 py-1 rounded">pulse</code> | <code className="bg-white px-2 py-1 rounded">float</code> | <code className="bg-white px-2 py-1 rounded">rotate</code> | <code className="bg-white px-2 py-1 rounded">gradient</code> | <code className="bg-white px-2 py-1 rounded">bounce</code> | <code className="bg-white px-2 py-1 rounded">none</code>
        </p>
      </div>
    </div>
  );
}

export default BrandLogoPreview;
