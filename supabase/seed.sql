-- Seed categories
INSERT INTO categories (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Luxury Hotel'),
  ('22222222-2222-2222-2222-222222222222', 'Tour Operator'),
  ('33333333-3333-3333-3333-333333333333', 'Transportation'),
  ('44444444-4444-4444-4444-444444444444', 'Restaurant'),
  ('55555555-5555-5555-5555-555555555555', 'Activity Provider');

-- Seed vendors
INSERT INTO vendors (id, name, city) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'The Ritz Paris', 'Paris'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tokyo Adventures', 'Tokyo'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Alpine Express', 'Zurich'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Bella Italia Tours', 'Rome'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'NYC Food Tours', 'New York');

-- Seed vendor-category associations
INSERT INTO vendor_categories (vendor_id, category_id) VALUES
  -- The Ritz Paris: Luxury Hotel
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  -- Tokyo Adventures: Tour Operator, Activity Provider
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555'),
  -- Alpine Express: Transportation
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333'),
  -- Bella Italia Tours: Tour Operator, Restaurant
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444'),
  -- NYC Food Tours: Tour Operator, Restaurant
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444');
