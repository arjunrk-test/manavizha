-- 1. Add "category" column to master_subcaste to map it to the parent caste
ALTER TABLE master_subcaste ADD COLUMN IF NOT EXISTS category VARCHAR(255);

-- 2. Insert major Tamil Nadu Castes safely
DO $$
DECLARE
   row record;
BEGIN
   FOR row IN VALUES 
      ('Brahmin - Iyer'), 
      ('Brahmin - Iyengar'), 
      ('Vanniyar'), 
      ('Thevar / Mukkulathor'), 
      ('Gounder'), 
      ('Chettiar'), 
      ('Vellalar / Pillai'), 
      ('Mudaliar'), 
      ('Nadar'), 
      ('Yadava / Konar'), 
      ('Naidu'), 
      ('Viswakarma / Achari'), 
      ('Reddy'), 
      ('Muthuraja')
      
   LOOP
      IF NOT EXISTS (SELECT 1 FROM master_caste WHERE value = row.column1) THEN
         INSERT INTO master_caste (value) VALUES (row.column1);
      END IF;
   END LOOP;
END;
$$;

-- 3. Insert Subcastes mapped to their parent castes
DO $$
DECLARE
   row record;
BEGIN
   FOR row IN VALUES 
      ('Vadama', 'Brahmin - Iyer'),
      ('Brahmincharnam', 'Brahmin - Iyer'),
      ('Vathima', 'Brahmin - Iyer'),
      ('Ashtasahasram', 'Brahmin - Iyer'),
      ('Gurukkal', 'Brahmin - Iyer'),

      ('Vadakalai', 'Brahmin - Iyengar'),
      ('Thenkalai', 'Brahmin - Iyengar'),

      ('Vanniyar', 'Vanniyar'),
      ('Padayachi', 'Vanniyar'),
      ('Naicker', 'Vanniyar'),
      ('Gounder', 'Vanniyar'),

      ('Agamudayar (Thevar)', 'Thevar / Mukkulathor'),
      ('Kallar', 'Thevar / Mukkulathor'),
      ('Maravar', 'Thevar / Mukkulathor'),

      ('Kongu Vellalar', 'Gounder'),
      ('Kurumba', 'Gounder'),
      ('Vettuva', 'Gounder'),

      ('Nattukottai', 'Chettiar'),
      ('Vellan', 'Chettiar'),
      ('Devanga', 'Chettiar'),
      ('Vania', 'Chettiar'),
      ('Arya Vysya', 'Chettiar'),
      ('Beri', 'Chettiar'),

      ('Saiva Pillai', 'Vellalar / Pillai'),
      ('Karkarthar', 'Vellalar / Pillai'),
      ('Sozhia Vellalar', 'Vellalar / Pillai'),

      ('Agamudayar (Mudaliar)', 'Mudaliar'),
      ('Sengunthar', 'Mudaliar'),
      ('Thondaimandala Saiva', 'Mudaliar'),

      ('Hindu Nadar', 'Nadar'),
      ('Christian Nadar', 'Nadar'),
      ('Kongu Nadar', 'Nadar'),

      ('Tamil Yadava', 'Yadava / Konar'),
      ('Telugu Yadava', 'Yadava / Konar'),

      ('Balija', 'Naidu'),
      ('Gavara', 'Naidu'),
      ('Kammavar', 'Naidu'),

      ('Kammalar', 'Viswakarma / Achari'),
      ('Asari', 'Viswakarma / Achari'),

      ('Paraiyar', 'Adi Dravida / SC'),
      ('Arunthathiyar', 'Adi Dravida / SC'),
      ('Pallar', 'Adi Dravida / SC'),

      ('Pokanati', 'Reddy'),
      ('Pedakanti', 'Reddy'),

      ('Muthuraja Ambalakarar', 'Muthuraja')
   LOOP
      IF NOT EXISTS (SELECT 1 FROM master_subcaste WHERE value = row.column1 AND category = row.column2) THEN
         INSERT INTO master_subcaste (value, category) VALUES (row.column1, row.column2);
      END IF;
   END LOOP;
END;
$$;
