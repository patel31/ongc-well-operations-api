CREATE TABLE IF NOT EXISTS well_operations (
  id UUID PRIMARY KEY,
  well_no VARCHAR(50) NOT NULL UNIQUE,
  job VARCHAR(200) NOT NULL,
  purpose TEXT NOT NULL,
  operation_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_well_operations_operation_at
  ON well_operations (operation_at DESC);
