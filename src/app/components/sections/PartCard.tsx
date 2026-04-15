import { Link } from 'react-router-dom';
import { AlertCircle, Package, ShoppingCart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

function isLoggedIn(): boolean {
  return !!(localStorage.getItem('authToken') || localStorage.getItem('token'));
}

function formatPrice(price: number | string): string {
  const num = parseFloat(String(price));
  if (isNaN(num)) return 'GH₵0.00';
  return `GH₵${num.toFixed(2)}`;
}

interface PartCardProps {
  name: string;
  price: number | string;
  imageUrl?: string | null;
  description?: string | null;
  category?: string | null;
  stockQuantity?: number;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  onAuthRequired?: () => void;
  showStockStatus?: boolean;
}

export function PartCard({
  name,
  price,
  imageUrl,
  description,
  category,
  stockQuantity,
  actionLabel = 'Shop Now',
  actionHref = '/shop',
  onAction,
  onAuthRequired,
  showStockStatus = false,
}: PartCardProps) {
  const { isDark } = useTheme();
  const isLowStock = typeof stockQuantity === 'number' && stockQuantity > 0 && stockQuantity <= 5;

  return (
    <article className={`group h-full border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
      isDark
        ? 'bg-slate-900/50 border-slate-800 shadow-[inset_0_1px_0_rgba(148,163,184,0.06)] hover:border-cyan-500/50 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_18px_32px_-22px_rgba(34,211,238,0.45)]'
        : 'bg-white border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md'
    }`}>
      <div className={`relative h-48 overflow-hidden flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-950' : 'bg-gray-100'}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isDark ? 'bg-cyan-500/15 border border-cyan-300/30' : 'bg-blue-50 border border-blue-200'}`}>
              <Package className={`w-8 h-8 ${isDark ? 'text-cyan-200' : 'text-blue-400'}`} />
            </div>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>No Image</span>
          </div>
        )}

        {category ? (
          <span className={`absolute top-3 left-3 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm ${isDark ? 'bg-slate-900/80 text-cyan-200 border-cyan-400/30' : 'bg-white/90 text-blue-700 border-blue-200'}`}>
            {category}
          </span>
        ) : null}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className={`font-bold text-base leading-snug mb-1 line-clamp-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
          {name}
        </h3>

        {description ? (
          <p className={`text-sm line-clamp-2 mb-3 flex-1 ${isDark ? 'text-slate-300/80' : 'text-gray-600'}`}>{description}</p>
        ) : (
          <div className="flex-1" />
        )}

        <div className={`mt-auto flex items-center justify-between pt-3 border-t gap-2 flex-wrap ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
          <div className="flex flex-col gap-1">
            <span className={`inline-block text-base font-extrabold px-3 py-1 rounded-full tracking-wide ${isDark ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              {formatPrice(price)}
            </span>
            {showStockStatus && typeof stockQuantity === 'number' && isLowStock ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                <AlertCircle className="w-3 h-3" />
                Low Stock ({stockQuantity})
              </span>
            ) : null}
          </div>

          {onAction ? (
            <button
              onClick={() => {
                if (actionLabel === 'Add to Cart' && !isLoggedIn()) {
                  onAuthRequired?.();
                  return;
                }
                onAction();
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-colors duration-150 shadow-sm bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-300 text-slate-950"
            >
              {actionLabel === 'Add to Cart' ? <ShoppingCart className="w-4 h-4" /> : null}
              {actionLabel}
            </button>
          ) : (
            <Link
              to={actionHref}
              className="inline-flex items-center gap-1.5 justify-center text-sm font-semibold px-3 py-2 rounded-xl transition-colors duration-150 shadow-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            >
              {actionLabel === 'Add to Cart' ? <ShoppingCart className="w-4 h-4" /> : null}
              {actionLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
