INSERT INTO users (username, password_hash)
VALUES ('admin', '$2b$10$V2h0QhVQmYfXrI6R3fPySOmUWW3Fh0x4xWoF4mRr3Xad5q6v9FJ7K')
ON CONFLICT (username) DO NOTHING;

INSERT INTO warehouses (code, name)
VALUES
('WH-NORTH', 'North Hub'),
('WH-SOUTH', 'South Hub'),
('WH-EAST', 'East Hub'),
('WH-WEST', 'West Hub'),
('WH-CENTRAL', 'Central Hub')
ON CONFLICT (code) DO NOTHING;

INSERT INTO categories (name)
VALUES
('Electronics'),
('Apparel'),
('Home'),
('Sports'),
('Books'),
('Health'),
('Automotive'),
('Food')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, description, category_id)
SELECT
  'Product ' || gs::text,
  'Generated product #' || gs::text,
  ((gs - 1) % 8) + 1
FROM generate_series(1, 1500) AS gs
ON CONFLICT DO NOTHING;

INSERT INTO inventory (product_id, warehouse_id, quantity)
SELECT p.id, w.id, (random() * 100)::int
FROM products p
CROSS JOIN warehouses w
WHERE p.id <= 1500
ON CONFLICT (product_id, warehouse_id)
DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP;
