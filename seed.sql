INSERT INTO questions (category, difficulty, stem, options, correct_index, explanation) VALUES
-- Blood Bank examples
('BloodBank', 2, 'Which antibody is most likely to show dosage?', '["anti-Jka","anti-D","anti-K","anti-e"]', 0, 'Kidd antibodies often show dosage.'),
('BloodBank', 3, 'A patient with anti-D requires transfusion. Which units are compatible?', '["D+ units","O negative units","Any Rh type","AB positive units"]', 1, 'Anti-D requires D-negative RBCs.'),

-- Chemistry examples
('Chemistry', 2, 'In diabetes mellitus, which laboratory result is most consistent with poor control?', '["HbA1c 5.2%","Fasting glucose 130 mg/dL","2-hr OGTT 110 mg/dL","Fructosamine 190 µmol/L"]', 1, 'Fasting glucose ≥126 mg/dL suggests diabetes.'),
('Chemistry', 3, 'Increased anion gap metabolic acidosis is seen in:', '["Vomiting","Diarrhea","Lactic acidosis","Hyperaldosteronism"]', 2, 'Lactic acidosis increases unmeasured anions.'),

-- Hematology examples
('Hematology', 2, 'Which RBC index best reflects average size?', '["MCH","MCV","MCHC","RDW"]', 1, 'MCV is mean corpuscular volume.'),
('Hematology', 3, 'Auer rods are classically seen in:', '["CML","ALL","AML","IDA"]', 2, 'Auer rods are seen in AML.'),

-- Microbiology examples
('Microbiology', 2, 'Optochin susceptibility is used to identify:', '["S. pyogenes","S. pneumoniae","S. agalactiae","Enterococcus faecalis"]', 1, 'S. pneumoniae is optochin susceptible.'),
('Microbiology', 3, 'Acid-fast staining detects:', '["Mycoplasma","Mycobacteria","Chlamydia","Spirochetes"]', 1, 'Mycobacteria are acid-fast.'),

-- Urinalysis examples
('Urinalysis', 2, 'Waxy casts are most associated with:', '["Acute pyelonephritis","Chronic renal failure","Exercise","Nephrotic syndrome"]', 1, 'Waxy casts indicate chronic renal failure.'),

-- Immunology examples
('Immunology', 2, 'The primary immunoglobulin in secondary response is:', '["IgM","IgG","IgA","IgE"]', 1, 'IgG predominates in secondary response.'),

-- Lab Ops examples
('LabOps', 2, 'Westgard rule 2-2s indicates:', '["Random error","Systematic error","No error","Clerical error"]', 1, 'Two consecutive 2 SD same-side violations suggest systematic error.');
