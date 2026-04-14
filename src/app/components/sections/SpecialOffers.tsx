import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Zap, Droplet, Zap as Spark, Gauge, Clock } from 'lucide-react';

export function SpecialOffers() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const offers = [
    { 
      title: '20% Off Oil Change', 
      description: 'Get 20% discount on full oil and filter service', 
      valid: 'Valid until March 31, 2026', 
      savings: 'Save up to $15',
      icon: Droplet,
      symbol: '🛢️',
      color: 'from-amber-400 to-orange-400',
      lightColor: 'bg-amber-50',
      badgeColor: 'bg-amber-100 text-amber-700'
    },
    { 
      title: 'Free Brake Inspection', 
      description: 'Complimentary brake system inspection and diagnosis', 
      valid: 'Limited time offer', 
      savings: 'Value $50',
      icon: Gauge,
      symbol: '🔴',
      color: 'from-violet-400 to-purple-400',
      lightColor: 'bg-violet-50',
      badgeColor: 'bg-violet-100 text-violet-700'
    },
    { 
      title: 'Battery Check Special', 
      description: 'Free battery health check + 10% off replacement', 
      valid: 'Valid until April 30, 2026', 
      savings: 'Save up to $20',
      icon: Spark,
      symbol: '🔋',
      color: 'from-yellow-400 to-amber-400',
      lightColor: 'bg-yellow-50',
      badgeColor: 'bg-yellow-100 text-yellow-700'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-slate-50/30 to-white relative overflow-hidden">
      {/* Soft animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 right-20 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-amber-50 rounded-full animate-pulse">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-600">Limited Time Offers</span>
          </div>
          <h2 className="text-5xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-clip-text text-transparent">Special Deals for You</h2>
          <p className="text-gray-600 text-lg mt-2">Exclusive discounts on our most popular services</p>
          <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-violet-400 rounded-full mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {offers.map((offer, idx) => {
            const Icon = offer.icon;
            return (
              <div 
                key={idx} 
                className={`group relative transform transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                {/* Soft glow wrapper */}
                <div className={`absolute -inset-2 bg-gradient-to-r ${offer.color} rounded-2xl opacity-0 group-hover:opacity-10 blur-lg transition-all duration-500 group-hover:blur-xl`}></div>
                
                {/* Main card */}
                <div className={`relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden ${offer.lightColor} group-hover:${offer.lightColor}`}>
                  
                  {/* Subtle top accent border that slides in */}
                  <div className={`h-1 bg-gradient-to-r ${offer.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700`}></div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 shimmer-bg opacity-0 group-hover:opacity-30 group-hover:animate-shimmer transition-opacity duration-500 pointer-events-none"></div>
                  
                  {/* Floating symbol with creative animation */}
                  <div className="absolute top-3 right-3 text-3xl opacity-0 group-hover:opacity-15 group-hover:animate-float-rotate transition-all duration-300 pointer-events-none">
                    {offer.symbol}
                  </div>
                  
                  <div className="relative z-10 p-8">
                    {/* Icon and savings with staggered animations */}
                    <div className="flex items-start justify-between mb-6">
                      {/* Icon with slide and rotate */}
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${offer.color} text-white shadow-md group-hover:shadow-lg group-hover:animate-rotate-scale transition-all duration-300 group-hover:scale-105`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      {/* Savings badge with wave animation */}
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${offer.badgeColor} shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:animate-wave`}>
                        {offer.savings}
                      </span>
                    </div>
                    
                    {/* Title with smooth gradient transition */}
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-500"
                      style={{
                        background: isVisible ? `linear-gradient(to right, var(--tw-gradient-stops))` : 'none'
                      }}>
                      {offer.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {offer.description}
                    </p>
                    
                    {/* Bottom section with slide animation */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 group-hover:border-gray-300 transition-colors duration-300">
                      <div className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-gray-700 transition-all duration-300">
                        <Clock className="w-3 h-3" />
                        <span className="group-hover:animate-slide-fade">{offer.valid}</span>
                      </div>
                      
                      {/* Button with creative hover */}
                      <Button 
                        size="sm" 
                        className={`bg-gradient-to-r ${offer.color} text-white shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105 hover:brightness-110 font-medium`}
                      >
                        Claim
                      </Button>
                    </div>
                    
                    {/* Animated bottom line */}
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${offer.color} w-0 group-hover:w-full transition-all duration-700`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Info banner */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
          <p className="text-gray-700">
            <span className="font-semibold">📌 Tip:</span> Use code <span className="font-mono font-bold text-blue-600">AUTO20</span> for automatic discount application at checkout
          </p>
        </div>
      </div>
    </section>
  );
}




