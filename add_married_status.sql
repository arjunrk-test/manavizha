-- Insert 'Married' into master_marital_status if it doesn't already exist
INSERT INTO master_marital_status (value)
SELECT 'Married'
WHERE NOT EXISTS (
    SELECT 1 FROM master_marital_status WHERE value = 'Married'
);
