import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';

function formatPrice(price: number | string): string {
  const num = parseFloat(String(price));
  if (isNaN(num)) return String(price);
  return `GH₵${num.toFixed(2)}`;
}

interface ServiceCardProps {
  title: string;
  description?: string;
  price: number | string;
  imageUrl?: string;
  onBook?: () => void;
  bookHref?: string;
}

export function ServiceCard({
  title,
  description,
  price,
  imageUrl,
  onBook,
  bookHref,
}: ServiceCardProps) {
  const { isDark } = useTheme();

  return (
    <article className={`group h-full border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
      isDark
        ? 'bg-slate-900/50 border-slate-800 shadow-[inset_0_1px_0_rgba(148,163,184,0.06)] hover:border-cyan-500/50 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_18px_32px_-22px_rgba(34,211,238,0.45)]'
        : 'bg-white border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md'
    }`}>
      <div className={`relative h-60 w-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-gray-100'}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Wrench className={`w-14 h-14 ${isDark ? 'text-cyan-200/80' : 'text-blue-300'}`} />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className={`text-lg font-bold leading-snug ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{title}</h3>

        {description ? (
          <p className={`text-sm line-clamp-2 flex-1 ${isDark ? 'text-slate-300/80' : 'text-gray-600'}`}>{description}</p>
        ) : (
          <div className="flex-1" />
        )}

        <div className={`flex items-center justify-between pt-2 border-t mt-auto gap-3 ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
          <span className={`inline-block text-base font-extrabold px-3 py-1 rounded-full tracking-wide ${isDark ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {formatPrice(price)}
          </span>

          {onBook ? (
            <Button
              size="sm"
              onClick={onBook}
              className="flex items-center gap-1.5 rounded-lg font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            >
              Book Now
            </Button>
          ) : (
            <Link
              to={bookHref ?? '/register'}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            >
              Book Now
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
