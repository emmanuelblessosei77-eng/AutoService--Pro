-- Sample inserts for development
-- Clear existing data to make init idempotent
TRUNCATE order_items, orders, bookings, car_parts, services, vehicles, users RESTART IDENTITY CASCADE;

INSERT INTO users (first_name, last_name, email, phone, role, created_at) VALUES
('John','Doe','john@example.com','555-0100','customer',NOW()),
('Jane','Smith','jane@example.com','555-0101','mechanic',NOW()),
('Admin','User','admin@example.com','555-0110','admin',NOW());

INSERT INTO services (name, description, price, duration_minutes, category) VALUES
('Regular Maintenance','Comprehensive maintenance',99.00,60,'maintenance'),
('Diagnostics','Diagnostics check',149.00,90,'diagnostics'),
('Brake Service','Brake inspection and replacement',120.00,120,'brakes');

INSERT INTO car_parts (name, description, category, price, stock_quantity) VALUES
('Synthetic Motor Oil 5W-30','Premium synthetic motor oil','Engine Oil',45.00,100),
('Engine Air Filter','High-efficiency engine air filter','Filters',25.00,50),
('Car Battery AGM 12V 100Ah','Advanced AGM battery','Batteries',189.00,20);

-- Sample vehicle
INSERT INTO vehicles (user_id, make, model, year) VALUES
(1,'Toyota','Camry',2020);

-- Sample booking
INSERT INTO bookings (user_id, service_id, vehicle_id, mechanic_assigned, booking_datetime, status, notes) VALUES
(1,1,1,2,NOW() + INTERVAL '2 days','pending','Customer prefers morning slot');
