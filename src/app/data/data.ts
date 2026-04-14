// Service Types (used in both services page and dashboard)
export const services = [
  {
    id: 'oilchange',
    title: 'Oil Change',
    description: 'Regular oil and filter replacement to keep your engine running smoothly.',
    image: 'https://cdn.pixabay.com/photo/2019/01/30/11/22/oil-3964367_1280.jpg',
    price: 49,
    rating: 4.8,
    duration: 30,
    category: 'Maintenance'
  },
  {
    id: 'diagnostics',
    title: 'Diagnostic Testing',
    description: 'Advanced diagnostic services to identify and fix vehicle issues quickly.',
    image: 'https://images.pexels.com/photos/13065689/pexels-photo-13065689.jpeg?_gl=1*vogn8l*_ga*MTU4MTU3OTQ1LjE3NDI4Njk5OTI.*_ga_8JE65Q40S6*czE3NzI1ODUyNDkkbzUkZzEkdDE3NzI1ODUzNjckajQ5JGwwJGgw',
    price: 79,
    rating: 4.9,
    duration: 45,
    category: 'Diagnostics'
  },
  {
    id: 'engineservicing',
    title: 'Engine Servicing',
    description: 'Complete engine maintenance and servicing for optimal performance.',
    image: 'https://images.pexels.com/photos/4116220/pexels-photo-4116220.jpeg?_gl=1*fop2ux*_ga*MTU4MTU3OTQ1LjE3NDI4Njk5OTI.*_ga_8JE65Q40S6*czE3NzI1ODUyNDkkbzUkZzEkdDE3NzI1ODU0ODIkajM3JGwwJGgw',
    price: 149,
    rating: 4.7,
    duration: 90,
    category: 'Maintenance'
  },
  {
    id: 'battery',
    title: 'Battery Service',
    description: 'Battery testing, replacement, and charging services.',
    image: 'https://images.pexels.com/photos/8478228/pexels-photo-8478228.jpeg?_gl=1*d5pfxp*_ga*MTU4MTU3OTQ1LjE3NDI4Njk5OTI.*_ga_8JE65Q40S6*czE3NzI1ODUyNDkkbzUkZzEkdDE3NzI1ODY1MDUkajQ0JGwwJGgw',
    price: 89,
    rating: 4.6,
    duration: 30,
    category: 'Maintenance'
  },
  {
    id: 'tirereplacement',
    title: 'Tire Replacement',
    description: 'Professional tire installation, repair, and replacement services.',
    image: 'https://images.pexels.com/photos/5733659/pexels-photo-5733659.jpeg?_gl=1*1skpsnr*_ga*MTU4MTU3OTQ1LjE3NDI4Njk5OTI.*_ga_8JE65Q40S6*czE3NzI1ODUyNDkkbzUkZzEkdDE3NzI1ODY3NTgkajM0JGwwJGgw',
    price: 199,
    rating: 4.8,
    duration: 60,
    category: 'Maintenance'
  },
  {
    id: 'brakservice',
    title: 'Brake Service',
    description: 'Comprehensive brake inspection, repair, and pad replacement.',
    image: 'https://images.pexels.com/photos/6870299/pexels-photo-6870299.jpeg?_gl=1*5np1mm*_ga*MTU4MTU3OTQ1LjE3NDI4Njk5OTI.*_ga_8JE65Q40S6*czE3NzI1ODUyNDkkbzUkZzEkdDE3NzI1ODY2NTUkajQwJGwwJGgw',
    price: 129,
    rating: 4.7,
    duration: 60,
    category: 'Safety'
  }
];

// Car Parts Data
export const parts = [
  {
    id: 1,
    name: 'Premium Oil Filter',
    category: 'Filters',
    price: 24,
    originalPrice: 34,
    rating: 4.8,
    reviews: 156,
    image: 'https://cdn.pixabay.com/photo/2017/05/23/17/00/filter-2337802_1280.jpg',
    description: 'High-quality oil filter for all major vehicles',
    stock_quantity: 50
  },
  {
    id: 2,
    name: 'Brake Pad Set',
    category: 'Brakes',
    price: 89,
    originalPrice: 129,
    rating: 4.9,
    reviews: 342,
    image: 'https://images.pexels.com/photos/6870299/pexels-photo-6870299.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'OEM equivalent ceramic brake pads',
    stock_quantity: 35
  },
  {
    id: 3,
    name: 'Air Filter',
    category: 'Filters',
    price: 19,
    originalPrice: 29,
    rating: 4.7,
    reviews: 198,
    image: 'https://cdn.pixabay.com/photo/2021/10/10/19/06/engine-6698421_1280.jpg',
    description: 'Replacement engine air filter',
    stock_quantity: 60
  },
  {
    id: 4,
    name: 'Shock Absorber',
    category: 'Suspension',
    price: 159,
    originalPrice: 239,
    rating: 4.8,
    reviews: 87,
    image: 'https://images.pexels.com/photos/9562265/pexels-photo-9562265.jpeg?_gl=1*fq37l4*_ga*MTU4MTU3OTQ1LjE3NDI4Njk5OTI.*_ga_8JE65Q40S6*czE3NzI4MTQ0MTckbzYkZzEkdDE3NzI4MTQ5MzYkajMkbDAkaDA.',
    description: 'Premium shock absorber for smooth ride',
    stock_quantity: 25
  },
  {
    id: 5,
    name: 'Battery',
    category: 'Electrical',
    price: 129,
    originalPrice: 189,
    rating: 4.9,
    reviews: 512,
    image: 'https://cdn.pixabay.com/photo/2015/10/18/21/41/battery-995257_1280.jpg',
    description: '12V car battery with 5-year warranty',
    stock_quantity: 40
  },
  {
    id: 6,
    name: 'Alternator',
    category: 'Electrical',
    price: 249,
    originalPrice: 349,
    rating: 4.7,
    reviews: 64,
    image: 'https://cdn.pixabay.com/photo/2014/11/02/01/57/voltage-regulator-513434_1280.jpg',
    description: 'High-output alternator assembly',
    stock_quantity: 20
  },
  {
    id: 7,
    name: 'Spark Plugs Set',
    category: 'Engine',
    price: 34,
    originalPrice: 54,
    rating: 4.8,
    reviews: 203,
    image: 'https://cdn.pixabay.com/photo/2017/09/30/03/40/spark-plug-2801172_1280.jpg',
    description: 'Premium spark plugs for better engine performance',
    stock_quantity: 55
  },
  {
    id: 8,
    name: 'Transmission Fluid',
    category: 'Engine',
    price: 44,
    originalPrice: 64,
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1687818802337-eeab0d3cf54c?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'High-quality transmission fluid for smooth shifting',
    stock_quantity: 45
  },
  {
    id: 9,
    name: 'Engine Coolant',
    category: 'Engine',
    price: 24,
    originalPrice: 39,
    rating: 4.8,
    reviews: 291,
    image: 'https://images.unsplash.com/photo-1590096227076-ebf4b077c89d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Premium engine coolant for optimal temperature control',
    stock_quantity: 65
  }
];

// Categories
export const categories = ['Engine', 'Brakes', 'Suspension', 'Electrical', 'Filters', 'Accessories'];

// Type definitions
export interface Part {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  stock_quantity: number;
}
