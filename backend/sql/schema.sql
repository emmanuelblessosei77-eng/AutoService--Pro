-- PostgreSQL schema for Car Service Management
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT,
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer','mechanic','admin')),
  address TEXT,
  city TEXT,
  postcode TEXT,
  specialty TEXT,
  hire_date DATE,
  access_level VARCHAR(20),
  membership_date DATE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  make TEXT,
  model TEXT,
  year INTEGER,
  mileage INTEGER DEFAULT 0,
  fuel_type VARCHAR(20) DEFAULT 'petrol',
  vin TEXT,
  license_plate TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE SET NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  mechanic_assigned INTEGER REFERENCES users(id) ON DELETE SET NULL,
  booking_datetime TIMESTAMP WITHOUT TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(20) DEFAULT 'pending',
  total_cost NUMERIC(10,2) DEFAULT 0,
  parts_cost NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS car_parts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  supplier TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  car_part_id INTEGER NOT NULL REFERENCES car_parts(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS part_requests (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  mechanic_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  part_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  reason TEXT,
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'fulfilled', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
