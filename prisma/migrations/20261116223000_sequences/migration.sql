-- Gap-tolerant, race-free counters for human-readable references.
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS project_ref_seq START 1001;
