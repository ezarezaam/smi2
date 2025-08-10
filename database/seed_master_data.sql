-- Seed data untuk tabel m_division
INSERT INTO m_division (name, description, status, created_at, updated_at)
VALUES
  ('IT', 'Information Technology Department', true, NOW(), NOW()),
  ('Finance', 'Finance Department', true, NOW(), NOW()),
  ('HR', 'Human Resources Department', true, NOW(), NOW()),
  ('Marketing', 'Marketing Department', true, NOW(), NOW()),
  ('Operations', 'Operations Department', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Seed data untuk tabel m_jabatan
INSERT INTO m_jabatan (name, description, status, created_at, updated_at)
VALUES
  ('Software Developer', 'Senior Software Developer', true, NOW(), NOW()),
  ('Accountant', 'Mid-level Accountant', true, NOW(), NOW()),
  ('HR Manager', 'Senior HR Manager', true, NOW(), NOW()),
  ('Marketing Specialist', 'Junior Marketing Specialist', true, NOW(), NOW()),
  ('Operations Manager', 'Senior Operations Manager', true, NOW(), NOW()),
  ('IT Support', 'Junior IT Support', true, NOW(), NOW()),
  ('Finance Manager', 'Senior Finance Manager', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
