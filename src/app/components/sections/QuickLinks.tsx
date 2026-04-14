import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Package, Award, Phone } from 'lucide-react';

export function QuickLinks() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const links = [
    { 
      title: 'Professional Services',
      description: 'Comprehensive automotive solutions',
      link: '/services',
      icon: Wrench,
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50'
    },
    { 
      title: 'Quality Parts',
      description: 'OEM and aftermarket parts',
      link: '/parts',
      icon: Package,
      color: 'from-orange-500 to-orange-600',
      lightColor: 'bg-orange-50'
    },
    { 
      title: 'Learn About Us',
      description: 'Our story and values',
      link: '/about',
      icon: Award,
      color: 'from-purple-500 to-purple-600',
      lightColor: 'bg-purple-50'
    },
    { 
      title: 'Get In Touch',
      description: 'Contact our team',
      link: '/contact',
      icon: Phone,
      color: 'from-green-500 to-green-600',
      lightColor: 'bg-green-50'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-red-500 to-purple-600 bg-clip-text text-transparent">Quick Access</h2>
          <p className="text-gray-600 text-lg mt-2">Everything you need, just one click away</p>
          <div className="h-1 w-24 bg-gradient-to-r from-orange-600 to-purple-600 rounded-full mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {links.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.link}
                className={`group relative overflow-hidden p-6 rounded-2xl transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-15 transition-opacity duration-500`} />
                
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} blur-lg opacity-0 group-hover:opacity-50 transition-all duration-500`}></div>
                </div>
                
                {/* Light background base */}
                <div className={`absolute inset-0 ${item.lightColor} rounded-2xl transition-all duration-300 group-hover:scale-105`}></div>
                
                {/* Content */}
                <div className="relative z-20">
                  <div className={`flex justify-center mb-6 relative`}>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center group-hover:scale-125 group-hover:shadow-2xl transition-all duration-300 shadow-lg`}>
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>
                  <h3 className={`font-bold text-lg mb-2 bg-gradient-to-r ${item.color} bg-clip-text text-transparent group-hover:opacity-90 transition-all duration-300`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                {/* Arrow indicator with animation */}
                <div className="absolute bottom-4 right-4 text-lg text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 group-hover:scale-125 transition-all duration-300">
                  ↗
                </div>
                
                {/* Border animation */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r transition-all duration-300 opacity-0 group-hover:opacity-100"
                  style={{
                    backgroundImage: `linear-gradient(white, white), linear-gradient(to right, rgb(59, 130, 246), rgb(34, 197, 94))`,
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                  }}
                ></div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}




