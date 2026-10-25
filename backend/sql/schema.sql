-- Idempotent schema: safe to run repeatedly (npm run migrate).
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id         SERIAL PRIMARY KEY,
  make       TEXT          NOT NULL,
  model      TEXT          NOT NULL,
  category   TEXT          NOT NULL,
  price      NUMERIC(12,2) NOT NULL CHECK (price > 0),
  quantity   INTEGER       NOT NULL DEFAULT 0 CHECK (quantity >= 0),  -- DB-level guard: stock can never go negative
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vehicles_make ON vehicles (LOWER(make));
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles (LOWER(category));

-- Audit trail. vehicle_id is kept NULL (not deleted) if the vehicle is later removed.
CREATE TABLE IF NOT EXISTS purchases (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER       NOT NULL REFERENCES users(id),
  vehicle_id INTEGER       REFERENCES vehicles(id) ON DELETE SET NULL,
  unit_price NUMERIC(12,2) NOT NULL,  -- price at time of purchase
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);
