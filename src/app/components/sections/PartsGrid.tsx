import { Button } from '../ui/button';
import { ShoppingCart } from 'lucide-react';

interface Part {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image?: string;
  description: string;
}

interface PartsGridProps {
  parts: Part[];
  onAddToCart?: (partName: string) => void;
}

export function PartsGrid({ parts, onAddToCart }: PartsGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {parts.length > 0 ? (
        parts.map((part) => (
          <div
            key={part.id}
            className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer flex flex-col h-full"
          >
            {/* Image Area - Taller with hover effects */}
            <div className="relative h-64 bg-gray-200 overflow-hidden flex-shrink-0">
              {part.image ? (
                <img
                  src={part.image}
                  alt={part.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(96, 165, 250) 100%)';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-white/50" />
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4 flex flex-col">
              {/* Category Badge */}
              <p className="text-xs font-semibold text-blue-600 uppercase mb-2 tracking-wide group-hover:text-blue-700 transition-colors duration-300">
                {part.category}
              </p>

              {/* Title with underline animation */}
              <div className="relative inline-block mb-2 self-start">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300 max-w-xs">
                  {part.name}
                </h3>
                <div className="absolute bottom-0 left-0 h-0.5 bg-blue-600 w-0 group-hover:w-full transition-all duration-500"></div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 flex-1 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                {part.description}
              </p>

              {/* Price and Button */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-base font-bold text-blue-600">GH₵{part.price.toFixed(2)}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => onAddToCart?.(part.name)}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 transition-all duration-300 group-hover:shadow-lg"
                >
                  <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Add
                </Button>
              </div>
            </div>

            {/* Bottom border accent */}
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent w-0 group-hover:w-full transition-all duration-700"></div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-600">No parts available</p>
        </div>
      )}
    </div>
  );
}




