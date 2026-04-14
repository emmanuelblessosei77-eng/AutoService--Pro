import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Clock, DollarSign, ChevronDown } from 'lucide-react';
import { services } from '../../data/data';

interface FilterOptions {
  searchQuery: string;
  priceRange: [number, number];
  rating: number;
  availability: string;
}

export function ServiceFilter() {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    priceRange: [50, 500],
    rating: 0,
    availability: 'all',
  });
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  // Filter services based on criteria
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.title
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase());
      const matchesPrice =
        service.price >= filters.priceRange[0] && service.price <= filters.priceRange[1];
      const matchesRating = service.rating >= filters.rating;
      return matchesSearch && matchesPrice && matchesRating;
    });
  }, [filters]);

  const updateFilter = (key: keyof FilterOptions, value: FilterOptions[keyof FilterOptions]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const priceRanges = [
    { label: '$0 - $100', value: [0, 100] },
    { label: '$100 - $250', value: [100, 250] },
    { label: '$250 - $500', value: [250, 500] },
    { label: '$500+', value: [500, 10000] },
  ];

  const ratings = [1, 2, 3, 4, 5];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section className="py-24 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold mb-4"
          >
            🔍 FIND YOUR SERVICE
          </motion.span>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find the Perfect Service
          </h2>
          <p className="text-lg text-gray-600">
            Search, filter, and discover the services that meet your needs and budget
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 border border-gray-200 sticky top-32 h-fit"
            >
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              </div>

              {/* Search Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Search Services
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Type service name..."
                    value={filters.searchQuery}
                    onChange={e => updateFilter('searchQuery', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <motion.button
                  onClick={() => setExpandedFilter(expandedFilter === 'price' ? null : 'price')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-300 transition font-semibold text-gray-900 group"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    Price Range
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedFilter === 'price' ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>

                <AnimatePresence>
                  {expandedFilter === 'price' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2 overflow-hidden"
                    >
                      {priceRanges.map(range => (
                        <button
                          key={range.label}
                          onClick={() => updateFilter('priceRange', range.value as [number, number])}
                          className={`w-full text-left px-3 py-2 rounded-lg transition ${
                            JSON.stringify(filters.priceRange) === JSON.stringify(range.value)
                              ? 'bg-blue-100 border-2 border-blue-500 text-blue-700 font-semibold'
                              : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-blue-300'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <motion.button
                  onClick={() => setExpandedFilter(expandedFilter === 'rating' ? null : 'rating')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-300 transition font-semibold text-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Min Rating
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedFilter === 'rating' ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>

                <AnimatePresence>
                  {expandedFilter === 'rating' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2 overflow-hidden"
                    >
                      {[
                        { label: 'All Ratings', value: 0 },
                        ...ratings.map(r => ({
                          label: `${r}+ Stars`,
                          value: r,
                        })),
                      ].map(option => (
                        <button
                          key={option.label}
                          onClick={() => updateFilter('rating', option.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition ${
                            filters.rating === option.value
                              ? 'bg-blue-100 border-2 border-blue-500 text-blue-700 font-semibold'
                              : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-blue-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() =>
                  setFilters({
                    searchQuery: '',
                    priceRange: [50, 500],
                    rating: 0,
                    availability: 'all',
                  })
                }
                className="w-full py-2 px-4 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Reset Filters
              </button>
            </motion.div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <motion.div
              className="mb-6 flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <p className="text-lg font-semibold text-gray-900">
                Found <span className="text-blue-600">{filteredServices.length}</span> services
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              <AnimatePresence mode="wait">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service, idx) => (
                    <motion.div
                      key={`${service.id}-${idx}`}
                      variants={itemVariants}
                      exit={{ opacity: 0, y: -20 }}
                      className="group relative"
                    >
                      {/* Hover Glow */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300 -z-10" />

                      {/* Card */}
                      <div className="relative bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-400 transition-all h-full flex flex-col shadow-sm hover:shadow-lg">
                        {/* Service Image */}
                        <div className="relative h-32 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-emerald-100">
                          {service.image ? (
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-400">
                              <span className="text-4xl">🔧</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {service.title}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(service.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 font-medium">
                            {service.rating.toFixed(1)}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                          {service.description}
                        </p>

                        {/* Duration */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 pb-4 border-t border-gray-200 pt-4">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>
                            {typeof service.duration === 'string'
                              ? service.duration
                              : `${service.duration} mins`}
                          </span>
                        </div>

                        {/* Price and CTA */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-500">From</span>
                            <div className="text-2xl font-bold text-blue-600">
                              ${service.price}
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg transition"
                          >
                            Book Now
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-16"
                  >
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No services found</h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or search terms
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
