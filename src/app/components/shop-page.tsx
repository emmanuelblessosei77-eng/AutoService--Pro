import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Dialog, DialogContent } from './ui/dialog';
import shopImg from '../images/shop.jpg';
import { Link } from 'react-router-dom';
import { PartCard } from './sections/PartCard';
import {
  Search,
  ShoppingCart,
  Package,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Loader2,
  Zap,
  Shield,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './header';
import { Footer } from './footer';
import { carParts as carPartsAPI, users as usersAPI } from '../../services/api';
import { resolvePartImage } from '../utils/partImageResolver';

// ─── Auth helper ─────────────────────────────────────────────────────────────
function isLoggedIn(): boolean {
  return !!(localStorage.getItem('authToken') || localStorage.getItem('token'));
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawPart {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: string;
  stock_quantity: number;
  supplier: string | null;
  image_url: string | null;
  is_available: boolean;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────



const CATEGORIES = [
  'All',
  'Engine',
  'Brake',
  'Electrical',
  'Tyres',
  'Filters',
  'Accessories',
] as const;

type Category = (typeof CATEGORIES)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (price: string): string => {
  const num = parseFloat(price);
  if (isNaN(num)) return 'GH₵0.00';
  return `GH₵${num.toFixed(2)}`;
};

const parsePrice = (price: string): number => {
  const num = parseFloat(price);
  return isNaN(num) ? 0 : num;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  const { isDark } = useTheme();
  const shade = isDark ? 'bg-slate-800' : 'bg-gray-200';
  return (
    <div className={`rounded-2xl overflow-hidden border animate-pulse ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200'}`}>
      <div className={`h-48 ${shade}`} />
      <div className="p-4 space-y-3">
        <div className={`h-4 rounded w-1/3 ${shade}`} />
        <div className={`h-5 rounded w-2/3 ${shade}`} />
        <div className={`h-4 rounded w-full ${shade}`} />
        <div className={`h-4 rounded w-3/4 ${shade}`} />
        <div className="flex justify-between items-center pt-2">
          <div className={`h-6 rounded w-20 ${shade}`} />
          <div className={`h-9 rounded w-28 ${shade}`} />
        </div>
      </div>
    </div>
  );
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onRemove: (id: number) => void;
  onProceedToPay: () => void;
}

// Checkout step definitions
const CHECKOUT_STEPS = ['Cart', 'Review', 'Pay'];

function CartDrawer({
  isOpen,
  onClose,
  items,
  onIncrement,
  onDecrement,
  onRemove,
  onProceedToPay,
}: CartDrawerProps) {
  const { isDark } = useTheme();
  const [checkoutStep, setCheckoutStep] = useState(0);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const subtotal = total;
  const tax = parseFloat((subtotal * 0.0).toFixed(2)); // Ghana: VAT handled at business level
  const grandTotal = subtotal + tax;

  // Reset to cart view when drawer closes
  useEffect(() => {
    if (!isOpen) setCheckoutStep(0);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl ${isDark ? 'bg-[#0d1526]' : 'bg-white'}`}
            style={{
              borderLeft: isDark ? '1px solid rgba(148,163,184,0.12)' : '1px solid rgba(0,0,0,0.1)',
            }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${isDark ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${isDark ? 'bg-cyan-500' : 'bg-blue-600'}`}>
                  <ShoppingCart className="w-[18px] h-[18px] text-white" />
                </div>
                <div>
                  <h2 className={`font-bold leading-tight ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Your Cart</h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{items.reduce((s, i) => s + i.qty, 0)} item{items.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-gray-100 hover:bg-gray-200 border-gray-200'}`}
                aria-label="Close cart"
              >
                <X className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
              </button>
            </div>

            {/* Step Progress Bar */}
            {items.length > 0 && (
              <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between relative">
                  {/* Progress line */}
                  <div className={`absolute left-0 right-0 top-4 h-0.5 z-0 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
                  <div
                    className={`absolute left-0 top-4 h-0.5 z-0 transition-all duration-500 ${isDark ? 'bg-cyan-500' : 'bg-blue-600'}`}
                    style={{ width: checkoutStep === 0 ? '0%' : checkoutStep === 1 ? '50%' : '100%' }}
                  />
                  {CHECKOUT_STEPS.map((step, idx) => (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                          idx <= checkoutStep
                            ? (isDark ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'bg-blue-600 border-blue-600 text-white') + ' shadow-md'
                            : (isDark ? 'bg-slate-800 border-slate-600 text-slate-500' : 'bg-gray-100 border-gray-300 text-gray-400')
                        }`}
                      >
                        {idx < checkoutStep ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-xs font-semibold ${idx <= checkoutStep ? (isDark ? 'text-cyan-400' : 'text-blue-600') : (isDark ? 'text-slate-500' : 'text-gray-400')}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center py-16 gap-5"
                >
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)' }}
                  >
                    <ShoppingCart className="w-12 h-12 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold text-lg">Your cart is empty</p>
                    <p className="text-sm text-gray-400 mt-1">Browse parts and add them to your cart</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-sm font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              ) : checkoutStep === 0 ? (
                // ── Step 0: Cart Items ──
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-2xl p-4 flex gap-3 items-start"
                      style={{
                        background: 'rgba(255,255,255,0.8)',
                        border: '1px solid rgba(37,99,235,0.1)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-100">
                        <Package className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatPrice(String(item.price))} each</p>
                        <div className="flex items-center justify-between mt-2.5">
                          <div
                            className="flex items-center gap-1 rounded-lg p-0.5"
                            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}
                          >
                            <button
                              onClick={() => onDecrement(item.id)}
                              className="w-7 h-7 rounded-md hover:bg-white flex items-center justify-center transition-all"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3 text-gray-600" />
                            </button>
                            <span className="text-sm font-bold text-gray-800 w-7 text-center">{item.qty}</span>
                            <button
                              onClick={() => onIncrement(item.id)}
                              className="w-7 h-7 rounded-md hover:bg-white flex items-center justify-center transition-all"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3 text-gray-600" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-700 text-sm">{formatPrice(String(item.price * item.qty))}</span>
                            <button
                              onClick={() => onRemove(item.id)}
                              className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-all"
                              aria-label="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : checkoutStep === 1 ? (
                // ── Step 1: Order Review ──
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className={`rounded-2xl p-4 border ${isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Order Summary</p>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className={`truncate flex-1 mr-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.name} × {item.qty}</span>
                          <span className={`font-semibold flex-shrink-0 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{formatPrice(String(item.price * item.qty))}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-2xl p-4 space-y-2 border ${isDark ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Subtotal</span>
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{formatPrice(String(subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Delivery</span>
                      <span className="font-medium text-emerald-500">Free</span>
                    </div>
                    <div className={`border-t pt-2 flex justify-between ${isDark ? 'border-slate-700' : 'border-blue-200'}`}>
                      <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Total</span>
                      <span className={`font-extrabold text-xl ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>{formatPrice(String(grandTotal))}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // ── Step 2: Pay ──
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col items-center text-center gap-6 py-6"
                >
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border ${isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-blue-50 border-blue-200'}`}>
                    <ShoppingCart className={`w-10 h-10 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className={`font-bold text-xl mb-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Ready to Pay?</p>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Sign in to complete your order securely via Paystack.</p>
                  </div>
                  <div className={`w-full rounded-2xl p-4 border ${isDark ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-blue-50 border-blue-200'}`}>
                    <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Order Total</p>
                    <p className={`text-3xl font-extrabold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>{formatPrice(String(grandTotal))}</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{items.reduce((s, i) => s + i.qty, 0)} item{items.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''} · Free Delivery</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer CTA */}
            {items.length > 0 && (
              <div className={`px-6 py-5 space-y-3 border-t ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                {checkoutStep < 2 ? (
                  <>
                    <div className="flex items-center justify-between px-1 mb-1">
                      <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {checkoutStep === 0 ? 'Cart Total' : 'Order Total'}
                      </span>
                      <span className={`text-xl font-extrabold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{formatPrice(String(grandTotal))}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (checkoutStep === 0) setCheckoutStep((s) => s + 1);
                        else if (checkoutStep === 1) onProceedToPay();
                      }}
                      className="w-full flex items-center justify-center gap-2.5 font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md text-base bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                    >
                      {checkoutStep === 0 ? 'Review Order' : 'Proceed to Pay'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    {checkoutStep > 0 && (
                      <button
                        onClick={() => setCheckoutStep((s) => s - 1)}
                        className={`w-full text-sm font-medium py-1.5 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        ← Back to Cart
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-2.5 font-bold py-4 px-6 rounded-2xl transition-all shadow-lg text-base bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Sign In &amp; Pay Now — {formatPrice(String(grandTotal))}
                    </Link>
                    <button
                      onClick={() => setCheckoutStep(1)}
                      className={`w-full text-sm font-medium py-1.5 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      ← Back to Review
                    </button>
                  </>
                )}
                <p className={`text-center text-xs ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                  🔒 Secured by Paystack · Ghana Cedis (GH₵)
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ShopPage() {
  const { isDark } = useTheme();
  const [parts, setParts] = useState<RawPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Validate auth token against backend on mount
  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) { setLoggedIn(false); return; }
      try {
        await usersAPI.getProfile();
        setLoggedIn(true);
      } catch {
        // Token is invalid or expired — clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setLoggedIn(false);
      }
    };
    validateAuth();
  }, []);

  // Fetch parts on mount
  useEffect(() => {
    let cancelled = false;

    const fetchParts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await carPartsAPI.getAll();
        if (!cancelled) {
          const partsList: RawPart[] = Array.isArray(data) ? data : (data as { data?: RawPart[] }).data ?? [];
          setParts(partsList);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load parts.';
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchParts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived: filtered parts
  const filteredParts = parts.filter((part) => {
    if (!part.is_available) return false;

    const matchesSearch =
      search.trim() === '' ||
      part.name.toLowerCase().includes(search.toLowerCase()) ||
      (part.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (part.category ?? '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === 'All' ||
      (part.category ?? '').toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Cart helpers
  const totalCartQty = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleAddToCart = (part: RawPart) => {
    if (!isLoggedIn()) {
      setAuthGateOpen(true);
      return;
    }
    setCartItems((prev) => {
    const existing = prev.find((i) => i.id === part.id);
      if (existing) {
        return prev.map((i) =>
          i.id === part.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          id: part.id,
          name: part.name,
          price: parsePrice(part.price),
          qty: 1,
        },
      ];
    });
  };

  const handleIncrement = (id: number) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
    );
  };

  const handleDecrement = (id: number) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      if (item.qty <= 1) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i));
    });
  };

  const handleRemove = (id: number) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Modal state must be inside the component
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  // Handler for proceeding to pay (final step)
  const handleProceedToPay = () => {
    setShowCheckoutModal(true);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-white'}`}>
      {/* Auth Gate Modal */}
      <Dialog open={authGateOpen} onOpenChange={setAuthGateOpen}>
        <DialogContent className={`w-full max-w-sm rounded-2xl shadow-2xl p-0 border ${isDark ? 'bg-[#0d1526] border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className={`p-6 flex flex-col items-center text-center gap-4`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-cyan-500/15 border border-cyan-400/30' : 'bg-blue-50 border border-blue-200'}`}>
              <ShoppingCart className={`w-8 h-8 ${isDark ? 'text-cyan-300' : 'text-blue-500'}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Sign in to add items</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                You need an account to add items to your cart and checkout.
              </p>
            </div>
            <div className="w-full flex flex-col gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setAuthGateOpen(false)}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors text-center ${isDark ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setAuthGateOpen(false)}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors text-center border ${isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Create an Account
              </Link>
            </div>
            <button
              onClick={() => setAuthGateOpen(false)}
              className={`text-xs ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Continue browsing
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal (final step) */}
      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent className={`w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-0 border ${isDark ? 'bg-[#0d1526] border-slate-800' : 'bg-white border-gray-200'}`}>
          {/* Header */}
          <div className="bg-cyan-500 text-slate-950 p-4 flex-shrink-0 rounded-t-lg">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl flex-shrink-0">🛒</span>
              <h2 className="text-xl font-bold">Checkout</h2>
            </div>
          </div>
          <div className="px-4 pb-4 pt-2 overflow-y-auto flex-1">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Items List */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                  <h3 className={`font-bold text-base truncate ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Items</h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className={`p-2 rounded border transition-all flex-shrink-0 ${isDark ? 'bg-slate-800/60 border-slate-700 hover:border-cyan-500/40' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-xs leading-tight truncate ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{item.name}</p>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-blue-100 text-blue-700'}`}>
                              x{item.qty}
                            </span>
                            <span className={`text-xs flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>@ {item.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-bold text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>GH₵{(item.price * item.qty).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Summary Panel */}
              <div className="lg:w-80 space-y-3 flex-shrink-0">
                <div className={`border rounded p-4 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`font-bold text-base mb-3 flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                    <span className="text-lg flex-shrink-0">💳</span> <span className="truncate">Total</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm gap-2">
                      <span className={`font-medium flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Items</span>
                      <span className={`font-bold flex-shrink-0 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{cartItems.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm gap-2">
                      <span className={`font-medium flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Subtotal</span>
                      <span className={`font-semibold flex-shrink-0 truncate ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>GH₵{cartItems.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}</span>
                    </div>
                    <div className={`border-t pt-2 ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-center gap-2">
                        <span className={`font-bold text-base flex-shrink-0 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Total</span>
                        <span className={`text-2xl font-bold flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>GH₵{cartItems.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`border rounded p-4 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex gap-2 items-start">
                    <div className="min-w-0">
                      <p className={`font-bold text-sm truncate ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>Secure</p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Paystack</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className={`border-t mt-4 pt-4 flex gap-3 flex-shrink-0 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className={`flex-1 font-bold text-sm py-2 rounded-lg transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              >
                Back
              </button>
              <button
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm py-2 rounded-lg shadow-md transition-colors"
                // onClick={handlePayment} // Implement payment logic here
              >
                Pay GH₵{cartItems.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Header />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="pt-4 sm:pt-8">
          <div className="relative overflow-hidden w-full h-[520px] sm:h-[650px] flex items-center justify-center">
            <img
              src={shopImg}
              alt="Shop Hero"
              className="absolute inset-0 w-full h-full object-cover object-center z-0"
              style={{ objectFit: 'cover' }}
            />
            <div className="absolute inset-0 bg-[#0a1324]/65 z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220]/90 via-[#0b1220]/68 to-[#0b1220]/45 z-[2]" />
            <div
              className="absolute inset-0 z-[3]"
              style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0) 35%, rgba(5,10,20,0.7) 100%)' }}
            />
            <div className="relative z-20 text-center w-full flex flex-col items-center justify-center h-full">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight drop-shadow-lg">
                Shop Auto Parts
              </h1>
              <p className="text-lg text-white mb-8 max-w-xl mx-auto drop-shadow">
                Genuine parts for every make &amp; model
              </p>
            </div>
          </div>
        </section>

        {/* Search bar moved below carousel, above categories */}
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-4">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search parts by name, category…"
              className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border focus:outline-none focus:ring-2 focus:border-transparent transition-all text-base ${isDark ? 'bg-slate-900/80 border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-cyan-500' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500'}`}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-cyan-400' : 'text-gray-400 hover:text-blue-600'}`}
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Category pills ── */}
        <>
          <section className={`sticky top-0 z-20 backdrop-blur-md border-b shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#10141c]/90 border-slate-800' : 'bg-white/90 border-gray-200'}`}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div
                ref={categoryScrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-none pb-1"
                style={{ scrollbarWidth: 'none' }}
              >
                <>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 ${
                        activeCategory === cat
                          ? (isDark ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-sm' : 'bg-blue-600 text-white border-blue-600 shadow-sm')
                          : (isDark ? 'bg-slate-900 text-slate-400 border-slate-700 hover:border-cyan-500/50 hover:text-slate-200' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-gray-900')
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </>
              </div>
            </div>
          </section>
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Result count */}
          {!loading && !error && (
            <div className="flex items-center justify-end mb-6">
              {(search || activeCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setActiveCategory('All');
                  }}
                  className={`text-sm hover:underline font-medium ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Failed to load parts
              </p>
              <p className={`text-sm max-w-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className={`mt-2 inline-flex items-center gap-2 font-semibold px-5 py-2 rounded-xl transition-colors text-sm ${isDark ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredParts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center gap-4"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}>
                <Package className={`w-10 h-10 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
              </div>
              <p className={`font-semibold text-lg ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                No parts found
              </p>
              <p className={`text-sm max-w-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                Try adjusting your search or selecting a different category.
              </p>
            </motion.div>
          )}

          {/* Grid */}
          {!loading && !error && filteredParts.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredParts.map((part) => (
                  <motion.div
                    key={part.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <PartCard
                      name={part.name}
                      price={part.price}
                      imageUrl={resolvePartImage(part.name, part.image_url)}
                      description={part.description}
                      category={part.category}
                      stockQuantity={part.stock_quantity}
                      actionLabel="Add to Cart"
                      actionHref={loggedIn ? undefined : '/login'}
                      onAction={loggedIn ? () => handleAddToCart(part) : undefined}
                      showStockStatus
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
        </>
      </main>

      <Footer />

      {/* ── Floating Cart Button (logged in only) ── */}
      {isLoggedIn() && (
        <AnimatePresence>
          {!cartOpen && (
            <motion.button
              key="cart-fab"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => setCartOpen(true)}
              className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full shadow-lg flex items-center justify-center transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalCartQty > 0 && (
                <motion.span
                  key={totalCartQty}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow"
                >
                  {totalCartQty > 99 ? '99+' : totalCartQty}
                </motion.span>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* ── Cart Drawer (logged in only) ── */}
      {isLoggedIn() && (
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onRemove={handleRemove}
          onProceedToPay={handleProceedToPay}
        />
      )}
    </div>
  );
}

export default ShopPage;
