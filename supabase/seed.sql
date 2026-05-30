-- =========================================================
-- DC UPS Benchmark / UPS Insight Seed Data
-- Purpose:
--   Backup core UPS vendor + product series + rating data
--   into GitHub repository.
--
-- Notes:
--   1. This seed is intended for restoration / reference.
--   2. Physical dimensions, footprint and weight are based on
--      available vendor source data where verified.
--   3. Items not verified should remain NULL or marked as
--      "to verify" in the application.
-- =========================================================


-- =========================================================
-- 1) Vendors
-- =========================================================

INSERT INTO public.vendors (name, country, website, notes)
VALUES
  ('ABB', 'Switzerland', 'https://new.abb.com/ups', 'UPS and power protection manufacturer.'),
  ('Delta Electronics', 'Taiwan', 'https://www.delta-singapore.com', 'Power electronics and modular UPS manufacturer.'),
  ('Eaton', 'United States', 'https://www.eaton.com', 'Major UPS and power management vendor.'),
  ('Huawei Digital Power', 'China', 'https://digitalpower.huawei.com', 'Data centre facility and modular UPS vendor.'),
  ('Mitsubishi Electric', 'Japan', 'https://www.mitsubishielectric.com', 'Large-capacity industrial UPS manufacturer.'),
  ('Riello UPS', 'Italy', 'https://www.riello-ups.com', 'UPS manufacturer with modular and high-power UPS range.'),
  ('Schneider Electric', 'France', 'https://www.se.com', 'Major electrical and data centre infrastructure vendor.'),
  ('Socomec', 'France', 'https://www.socomec.com', 'Power conversion and high-power UPS manufacturer.'),
  ('Vertiv', 'United States', 'https://www.vertiv.com', 'Critical power and data centre infrastructure vendor.')
ON CONFLICT (name) DO UPDATE SET
  country = EXCLUDED.country,
  website = EXCLUDED.website,
  notes = EXCLUDED.notes;


-- =========================================================
-- 2) UPS Product Series
-- =========================================================

WITH vendor_map AS (
  SELECT id, name
  FROM public.vendors
),
seed_products (
  vendor_name,
  product_series,
  topology,
  modular_type,
  min_capacity_kw,
  max_capacity_kw,
  max_parallel_kw,
  double_conversion_efficiency,
  eco_mode_efficiency,
  battery_type,
  access_requirement,
  monitoring_protocol,
  region_availability_summary,
  region_availability_detail,
  verification_status
) AS (
  VALUES
    ('ABB', 'MegaFlex DPA', 'Modular online double conversion UPS', 'Modular UPS', 250, 1500, NULL, 97.4, 99.0, 'VRLA / Li-ion', 'Modular frame access / clearance to be verified', 'Local and remote monitoring options to be verified', 'Global / Singapore availability to be verified', 'ABB MegaFlex DPA high-power UPS range. Exact cabinet and regional configuration to be verified.', 'Pending Review'),

    ('Delta Electronics', 'Modulon DPH', 'Modular online double conversion UPS', 'Modular UPS', 50, 600, NULL, NULL, NULL, 'VRLA / lithium-ion options to verify', 'Front access / service clearance to be verified', 'SNMP / Modbus options to be verified', 'Singapore / APAC availability to be verified', 'Delta Modulon DPH 50–600 kVA/kW modular UPS range.', 'Pending Review'),

    ('Eaton', '9395XC', 'Online double conversion', 'Monolithic', 1125, 2250, NULL, 97.5, 99.0, 'VRLA / lithium-ion', 'To verify with vendor', 'To verify with vendor', 'Global / APAC availability to verify', 'Eaton 9395XC high-power data centre UPS for hyperscale and enterprise applications.', 'Pending Review'),

    ('Eaton', '93PM', 'Online double conversion', 'Modular / scalable', 10, 400, NULL, 97.0, 99.0, 'VRLA / lithium-ion', 'To verify with vendor', 'To verify with vendor', 'Global / APAC availability to verify', 'Eaton 93PM scalable UPS range.', 'Pending Review'),

    ('Huawei Digital Power', 'UPS5000-H', 'Online double conversion', 'Modular', 400, 1600, NULL, 97.5, 99.1, 'Huawei SmartLi / battery options to verify', 'Front access / maintenance clearance to verify', 'Huawei monitoring / integration options to verify', 'Global / Singapore availability to be verified', 'Huawei UPS5000-H high-density modular UPS range.', 'Pending Review'),

    ('Mitsubishi Electric', '9900D', 'Online double conversion', 'Modular high-power UPS', 1200, 2000, NULL, 97.2, NULL, 'Battery options to verify', 'Front / rear access to verify', 'Monitoring options to verify', 'Global / Singapore availability to be verified', 'Mitsubishi Electric 9900D high-power UPS range.', 'Pending Review'),

    ('Riello UPS', 'Multi Power2', 'Online double conversion', 'Modular UPS', 120, 600, 3600, 98.1, NULL, 'VRLA / Li-ion', 'Front access / module service clearance to verify', 'Monitoring options to verify', 'Global / Singapore availability to be verified', 'Riello Multi Power2 modular UPS range.', 'Pending Review'),

    ('Schneider Electric', 'Galaxy VL', 'Online double conversion UPS', 'Modular / scalable', 200, 500, NULL, 97.0, 99.0, 'Lithium-ion compatible / external battery options to verify', 'Front access / service clearance to verify', 'EcoStruxure IT / secure monitoring options', 'Singapore / IEC regions / Global availability to be verified', 'Schneider Electric Galaxy VL scalable UPS range.', 'Pending Review'),

    ('Schneider Electric', 'Galaxy VX', 'Online double conversion UPS', 'Modular / scalable', 500, 1500, NULL, 95.9, 99.0, 'External battery options to verify', 'Front/rear access and cabinet clearance to verify', 'EcoStruxure IT / secure monitoring options', 'Global / Singapore availability to be verified', 'Schneider Electric Galaxy VX high-power UPS range.', 'Pending Review'),

    ('Schneider Electric', 'Galaxy VXL', 'Online double conversion UPS', 'Modular / scalable UPS', 500, 1250, 5000, 97.5, 99.0, 'Li-ion compatible', 'Full front access / no rear clearance to be verified', 'EcoStruxure IT / secure monitoring options', 'Singapore / IEC regions / Global availability to be verified', 'Schneider Electric Galaxy VXL 500–1250 kW UPS range.', 'Pending Review'),

    ('Socomec', 'DELPHYS XL', 'Online double conversion UPS', 'High-power monolithic / resilient architecture', 1000, 1200, NULL, 97.1, 99.1, 'Battery options to verify', 'Front/rear access to verify', 'Monitoring options to verify', 'Global / Singapore availability to be verified', 'Socomec DELPHYS XL high-power UPS range.', 'Pending Review'),

    ('Vertiv', 'Liebert APM2', 'Modular online double conversion UPS', 'Modular UPS', 10, 600, NULL, 97.5, NULL, 'VRLA / Li-ion', 'Access / service clearance to be verified', 'SNMP / Modbus options to be verified', 'Global availability to be verified', 'Vertiv Liebert APM2 10–600 kW modular UPS range.', 'Pending Review'),

    ('Vertiv', 'Liebert EXL S1', 'Online double conversion UPS', 'Monolithic / scalable', 300, 1200, 9600, NULL, 99.0, 'VRLA / lithium-ion options to verify', 'Front/top access; no rear access requirement to verify', 'Monitoring options to verify', 'Global / Singapore availability to be verified', 'Vertiv Liebert EXL S1 high-power UPS range.', 'Pending Review')
)

INSERT INTO public.ups_products (
  vendor_id,
  product_series,
  topology,
  modular_type,
  min_capacity_kw,
  max_capacity_kw,
  max_parallel_kw,
  double_conversion_efficiency,
  eco_mode_efficiency,
  battery_type,
  access_requirement,
  monitoring_protocol,
  region_availability_summary,
  region_availability_detail,
  verification_status
)
SELECT
  vm.id,
  sp.product_series,
  sp.topology,
  sp.modular_type,
  sp.min_capacity_kw,
  sp.max_capacity_kw,
  sp.max_parallel_kw,
  sp.double_conversion_efficiency,
  sp.eco_mode_efficiency,
  sp.battery_type,
  sp.access_requirement,
  sp.monitoring_protocol,
  sp.region_availability_summary,
  sp.region_availability_detail,
  sp.verification_status
FROM seed_products sp
JOIN vendor_map vm ON vm.name = sp.vendor_name
ON CONFLICT (vendor_id, product_series) DO UPDATE SET
  topology = EXCLUDED.topology,
  modular_type = EXCLUDED.modular_type,
  min_capacity_kw = EXCLUDED.min_capacity_kw,
  max_capacity_kw = EXCLUDED.max_capacity_kw,
  max_parallel_kw = EXCLUDED.max_parallel_kw,
  double_conversion_efficiency = EXCLUDED.double_conversion_efficiency,
  eco_mode_efficiency = EXCLUDED.eco_mode_efficiency,
  battery_type = EXCLUDED.battery_type,
  access_requirement = EXCLUDED.access_requirement,
  monitoring_protocol = EXCLUDED.monitoring_protocol,
  region_availability_summary = EXCLUDED.region_availability_summary,
  region_availability_detail = EXCLUDED.region_availability_detail,
  verification_status = EXCLUDED.verification_status;
  -- =========================================================
-- 3) UPS Available Ratings
-- =========================================================

WITH product_map AS (
  SELECT
    up.id AS product_id,
    v.name AS vendor_name,
    up.product_series
  FROM public.ups_products up
  JOIN public.vendors v ON v.id = up.vendor_id
),
seed_ratings (
  vendor_name,
  product_series,
  rating_label,
  kva,
  kw,
  efficiency,
  dimensions,
  footprint_m2,
  weight_kg,
  battery_option,
  datasheet_url
) AS (
  VALUES
    -- ABB MegaFlex DPA
    ('ABB', 'MegaFlex DPA', '250 kW', NULL::numeric, 250::numeric, 'Up to 97.4% double conversion / eco-mode to verify', 'To verify with vendor datasheet', NULL::numeric, NULL::numeric, 'VRLA / Li-ion', 'https://new.abb.com/ups'),
    ('ABB', 'MegaFlex DPA', '500 kW', NULL::numeric, 500::numeric, 'Up to 97.4% double conversion / eco-mode to verify', 'To verify with vendor datasheet', NULL::numeric, NULL::numeric, 'VRLA / Li-ion', 'https://new.abb.com/ups'),
    ('ABB', 'MegaFlex DPA', '1000 kW', 1000::numeric, 1000::numeric, 'Up to 97.4% double conversion / eco-mode to verify', '3300 mm W x 1000 mm D x 2200 mm H', 3.30::numeric, 3700::numeric, 'VRLA / Li-ion option to be verified', 'https://new.abb.com/ups/systems/high-power-ups/megaflex-ul/megaflex-ul-technical-data'),
    ('ABB', 'MegaFlex DPA', '1500 kW', 1500::numeric, 1500::numeric, 'Up to 97.4% double conversion / eco-mode to verify', '3300 mm W x 1000 mm D x 2200 mm H', 3.30::numeric, 4900::numeric, 'VRLA / Li-ion option to be verified', 'https://new.abb.com/ups/systems/high-power-ups/megaflex-ul/megaflex-ul-technical-data'),

    -- Delta Electronics Modulon DPH
    ('Delta Electronics', 'Modulon DPH', '50 kW', NULL::numeric, 50::numeric, 'Efficiency to verify; ECO mode / system efficiency subject to configuration', 'To verify with vendor datasheet', NULL::numeric, NULL::numeric, 'VRLA / lithium-ion options to verify', 'https://www.delta-singapore.com/en-SG/products/Modulon/50kva-600kva-three-phase-modular-ups-dph-series'),
    ('Delta Electronics', 'Modulon DPH', '300 kW', 300::numeric, 300::numeric, 'Efficiency to verify; ECO mode / system efficiency subject to configuration', '600 mm W x 1100 mm D x 2000 mm H', 0.66::numeric, 311::numeric, 'VRLA / lithium-ion options to verify', 'https://www.delta-singapore.com/en-SG/products/Modulon/50kva-600kva-three-phase-modular-ups-dph-series'),
    ('Delta Electronics', 'Modulon DPH', '600 kW', 600::numeric, 600::numeric, 'Efficiency to verify; ECO mode / system efficiency subject to configuration', '1200 mm W x 1100 mm D x 2000 mm H', 1.32::numeric, 605::numeric, 'VRLA / lithium-ion options to verify', 'https://www.delta-singapore.com/en-SG/products/Modulon/50kva-600kva-three-phase-modular-ups-dph-series'),

    -- Eaton 9395XC
    ('Eaton', '9395XC', '1125 kW', 1125::numeric, 1125::numeric, 'Up to 97.5% double conversion / 99% ESS', '93.5 in W x 33.5 in D x 78.9 in H', 2.02::numeric, NULL::numeric, 'VRLA / AGM / wet cell / lithium-ion', 'https://www.eaton.com/content/dam/eaton/products/backup-power-ups-surge-it-power-distribution/backup-power-ups/power-xpert-9395/9395xc/eaton-9395XC-ups-brochure-BR153147EN.pdf'),
    ('Eaton', '9395XC', '1500 kW', 1500::numeric, 1500::numeric, 'Up to 97.5% double conversion / 99% ESS', '106.3 in W x 33.5 in D x 78.9 in H', 2.30::numeric, NULL::numeric, 'VRLA / AGM / wet cell / lithium-ion', 'https://www.eaton.com/content/dam/eaton/products/backup-power-ups-surge-it-power-distribution/backup-power-ups/power-xpert-9395/9395xc/eaton-9395XC-ups-brochure-BR153147EN.pdf'),
    ('Eaton', '9395XC', '2000 kW', NULL::numeric, 2000::numeric, 'Up to 97.5% double conversion / 99% ESS', 'To verify with vendor datasheet', NULL::numeric, NULL::numeric, 'VRLA / lithium-ion', 'https://www.eaton.com'),
    ('Eaton', '9395XC', '2250 kW', 2250::numeric, 2250::numeric, 'Up to 97.5% double conversion / 99% ESS', '186.4 in W x 33.6 in D x 78.9 in H', 4.04::numeric, NULL::numeric, 'VRLA / AGM / wet cell / lithium-ion', 'https://www.eaton.com/content/dam/eaton/products/backup-power-ups-surge-it-power-distribution/backup-power-ups/power-xpert-9395/9395xc/eaton-9395XC-ups-brochure-BR153147EN.pdf'),

    -- Eaton 93PM
    ('Eaton', '93PM', '10 kW', NULL::numeric, 10::numeric, 'Up to 97% double conversion / 99% ESS', 'To verify with vendor datasheet', NULL::numeric, NULL::numeric, 'VRLA / lithium-ion', 'https://www.eaton.com/sg/en-us/catalog/backup-power-ups-surge-it-power-distribution/eaton-93pm-ups.html'),
    ('Eaton', '93PM', '50 kW', NULL::numeric, 50::numeric, 'Up to 97% double conversion / 99% ESS', 'To verify with vendor datasheet', NULL::numeric, NULL::numeric, 'VRLA / lithium-ion', 'https://www.eaton.com/sg/en-us/catalog/backup-power-ups-surge-it-power-distribution/eaton-93pm-ups.html'),
    ('Eaton', '93PM', '100 kW', NULL::numeric, 100::numeric, 'Up to 97% double conversion / 99% ESS', 'To verify with vendor datasheet', NULL::numeric, NULL::numeric, 'VRLA / lithium-ion', 'https://www.eaton.com/sg/en-us/catalog/backup-power-ups-surge-it-power-distribution/eaton-93pm-ups.html'),
    ('Eaton', '93PM', '200 kW', NULL::numeric, 200::numeric, 'Up to 97% double conversion / 99% ESS', 'To verify with vendor datasheet', NULL::numeric, NULL::numeric, 'VRLA / lithium-ion', 'https://www.eaton.com/sg/en-us/catalog/backup-power-ups-surge-it-power-distribution/eaton-93pm-ups.html'),
    ('Eaton', '93PM', '400 kW', 400::numeric, 400::numeric, 'Up to 97% double conversion / 99% ESS', '1618 mm W x 920 mm D x 1968 mm H', 1.49::numeric, 1070::numeric, 'VRLA / lithium-ion', 'https://www.eaton.com/ae/en-gb/skuPage.D640A0200A03031000.html'),

    -- Huawei UPS5000-H
    ('Huawei Digital Power', 'UPS5000-H', '400 kW', 400::numeric, 400::numeric, 'Up to 97.5% online / 99.1% S-ECO', '800 mm W x 1000 mm D x 2000 mm H', 0.80::numeric, 690::numeric, 'Huawei SmartLi / lead-acid battery options to verify', 'https://digitalpower.huawei.com/sg/data-center-facility/ups5000h'),
    ('Huawei Digital Power', 'UPS5000-H', '800 kW', 800::numeric, 800::numeric, 'Up to 97.5% online / 99.1% S-ECO', '1600 mm W x 1000 mm D x 2000 mm H', 1.60::numeric, 1300::numeric, 'Huawei SmartLi / lead-acid battery options to verify', 'https://digitalpower.huawei.com/sg/data-center-facility/ups5000h'),
    ('Huawei Digital Power', 'UPS5000-H', '1200 kW', 1200::numeric, 1200::numeric, 'Up to 97.5% online / 99.1% S-ECO', '1600 mm W x 1000 mm D x 2200 mm H', 1.60::numeric, 1600::numeric, 'Huawei SmartLi / lead-acid battery options to verify', 'https://digitalpower.huawei.com/sg/data-center-facility/ups5000h'),
    ('Huawei Digital Power', 'UPS5000-H', '1600 kW', 1600::numeric, 1600::numeric, 'Up to 97.5% online / 99.1% S-ECO', '2400 mm W x 1000 mm D x 2200 mm H', 2.40::numeric, 2300::numeric, 'Huawei SmartLi / lead-acid battery options to verify', 'https://digitalpower.huawei.com/sg/data-center-facility/ups5000h'),

    -- Mitsubishi Electric 9900D
    ('Mitsubishi Electric', '9900D', '1200 kW', 1200::numeric, 1200::numeric, 'Approx. 97.2%; ECO-mode >99% as SMS option; verify exact variant', '3400 mm W x 900 mm D x 2086 mm H', 3.06::numeric, 3400::numeric, 'VRLA / VLA / NiCad / Lithium-ion options to verify', 'https://www.mitsubishielectric.com.au/wp-content/uploads/2024/02/Flyer_9900D-UPS-2024-01.pdf'),
    ('Mitsubishi Electric', '9900D', '1600 kW', 1600::numeric, 1600::numeric, 'Approx. 97.2%; ECO-mode >99% as SMS option; verify exact variant', '4300 mm W x 900 mm D x 2086 mm H', 3.87::numeric, 4500::numeric, 'VRLA / VLA / NiCad / Lithium-ion options to verify', 'https://www.mitsubishielectric.com.au/wp-content/uploads/2024/02/Flyer_9900D-UPS-2024-01.pdf'),
    ('Mitsubishi Electric', '9900D', '2000 kW', 2000::numeric, 2000::numeric, 'Approx. 97.2%; ECO-mode >99% as SMS option; verify exact variant', '4900 mm W x 900 mm D x 2086 mm H', 4.41::numeric, 5300::numeric, 'VRLA / VLA / NiCad / Lithium-ion options to verify', 'https://www.mitsubishielectric.com.au/wp-content/uploads/2024/02/Flyer_9900D-UPS-2024-01.pdf'),

    -- Riello UPS Multi Power2
    ('Riello UPS', 'Multi Power2', '120 kW', NULL::numeric, 120::numeric, 'Up to 98.1% online double conversion with BLUE power modules', 'To verify with vendor datasheet', NULL::numeric, NULL::numeric, 'VRLA / Li-ion', 'https://www.riello-ups.com/products/1-ups/159-multi-power2'),
    ('Riello UPS', 'Multi Power2', '300 kW', 300::numeric, 300::numeric, 'Up to 98.1% online double conversion with BLUE power modules', '600 mm W x 870 mm D x 1995 mm H', 0.52::numeric, 640::numeric, 'VRLA / Li-ion / Supercaps; verify project configuration', 'https://www.riello-ups.com/uploads/file/942/3942/DATMP2M3T25BREN.pdf'),
    ('Riello UPS', 'Multi Power2', '600 kW', 600::numeric, 600::numeric, 'Up to 98.1% online double conversion with BLUE power modules', '3400 mm W x 1025 mm D x 2000 mm H', 3.49::numeric, 2465::numeric, 'VRLA / Li-ion / Supercaps; verify project configuration', 'https://www.riello-ups.com/uploads/file/942/3942/DATMP2M3T25BREN.pdf')
)
INSERT INTO public.ups_ratings (
  product_id,
  rating_label,
  kva,
  kw,
  efficiency,
  dimensions,
  footprint_m2,
  weight_kg,
  battery_option,
  datasheet_url
)
SELECT
  pm.product_id,
  sr.rating_label,
  sr.kva,
  sr.kw,
  sr.efficiency,
  sr.dimensions,
  sr.footprint_m2,
  sr.weight_kg,
  sr.battery_option,
  sr.datasheet_url
FROM seed_ratings sr
JOIN product_map pm
  ON pm.vendor_name = sr.vendor_name
 AND pm.product_series = sr.product_series
ON CONFLICT (product_id, rating_label) DO UPDATE SET
  kva = EXCLUDED.kva,
  kw = EXCLUDED.kw,
  efficiency = EXCLUDED.efficiency,
  dimensions = EXCLUDED.dimensions,
  footprint_m2 = EXCLUDED.footprint_m2,
  weight_kg = EXCLUDED.weight_kg,
  battery_option = EXCLUDED.battery_option,
  datasheet_url = EXCLUDED.datasheet_url;
  -- =========================================================
-- 4) UPS Available Ratings - Schneider / Socomec / Vertiv
-- =========================================================

WITH product_map AS (
  SELECT
    up.id AS product_id,
    v.name AS vendor_name,
    up.product_series
  FROM public.ups_products up
  JOIN public.vendors v ON v.id = up.vendor_id
),
seed_ratings (
  vendor_name,
  product_series,
  rating_label,
  kva,
  kw,
  efficiency,
  dimensions,
  footprint_m2,
  weight_kg,
  battery_option,
  datasheet_url
) AS (
  VALUES
    -- Schneider Electric Galaxy VL
    ('Schneider Electric', 'Galaxy VL', '200 kW', 200::numeric, 200::numeric, 'Up to 97% double conversion / 99% eConversion; verify exact load point', '850 mm W x 925 mm D x 1970 mm H', 0.79::numeric, 550::numeric, 'Li-ion compatible / external battery options to verify', 'https://www.se.com/sg/en/product/GVL200K500DS/galaxy-vl-ups-200-scalable-to-500kw-400-480v-startup-5x8/'),
    ('Schneider Electric', 'Galaxy VL', '300 kW', 300::numeric, 300::numeric, 'Up to 97% double conversion / 99% eConversion; verify exact load point', '850 mm W x 925 mm D x 1970 mm H', 0.79::numeric, 550::numeric, 'Li-ion compatible / external battery options to verify', 'https://www.se.com/sg/en/product/GVL200K500DS/galaxy-vl-ups-200-scalable-to-500kw-400-480v-startup-5x8/'),
    ('Schneider Electric', 'Galaxy VL', '400 kW', 400::numeric, 400::numeric, 'Up to 97% double conversion / 99% eConversion; verify exact load point', '850 mm W x 925 mm D x 1970 mm H', 0.79::numeric, 550::numeric, 'Li-ion compatible / external battery options to verify', 'https://www.se.com/sg/en/product/GVL200K500DS/galaxy-vl-ups-200-scalable-to-500kw-400-480v-startup-5x8/'),
    ('Schneider Electric', 'Galaxy VL', '500 kW', 500::numeric, 500::numeric, 'Up to 97% double conversion / 99% eConversion; verify exact load point', '850 mm W x 925 mm D x 1970 mm H', 0.79::numeric, 550::numeric, 'Li-ion compatible / external battery options to verify', 'https://www.se.com/sg/en/product/GVL200K500DS/galaxy-vl-ups-200-scalable-to-500kw-400-480v-startup-5x8/'),

    -- Schneider Electric Galaxy VX
    ('Schneider Electric', 'Galaxy VX', '500 kW', 500::numeric, 500::numeric, 'Up to 95.9% double conversion / 99% ECO or eConversion; verify exact configuration', '3200 mm W x 900 mm D x 1970 mm H', 2.88::numeric, 1956::numeric, 'External battery options to verify', 'https://www.productinfo.schneider-electric.com/galaxyvx_iec/5ac775e546e0fb00011d8257/990-5783D%20Galaxy%20VX%201500%20kW%20Installation/English/990-5783%201500%20kW%20UPS%20Installation_0000088640.xml/%24/UPSWeightsandDimensionsREF_0000110736'),
    ('Schneider Electric', 'Galaxy VX', '750 kW', 750::numeric, 750::numeric, 'Up to 95.9% double conversion / 99% ECO or eConversion; verify exact configuration', '3200 mm W x 900 mm D x 1970 mm H', 2.88::numeric, 2496::numeric, 'External battery options to verify', 'https://www.productinfo.schneider-electric.com/galaxyvx_iec/5ac775e546e0fb00011d8257/990-5783D%20Galaxy%20VX%201500%20kW%20Installation/English/990-5783%201500%20kW%20UPS%20Installation_0000088640.xml/%24/UPSWeightsandDimensionsREF_0000110736'),
    ('Schneider Electric', 'Galaxy VX', '1000 kW', 1000::numeric, 1000::numeric, 'Up to 95.9% double conversion / 99% ECO or eConversion; verify exact configuration', '3200 mm W x 900 mm D x 1970 mm H', 2.88::numeric, 3036::numeric, 'External battery options to verify', 'https://www.productinfo.schneider-electric.com/galaxyvx_iec/5ac775e546e0fb00011d8257/990-5783D%20Galaxy%20VX%201500%20kW%20Installation/English/990-5783%201500%20kW%20UPS%20Installation_0000088640.xml/%24/UPSWeightsandDimensionsREF_0000110736'),
    ('Schneider Electric', 'Galaxy VX', '1500 kW', 1500::numeric, 1500::numeric, 'Up to 95.9% double conversion / 99% ECO or eConversion; verify exact configuration', '3200 mm W x 900 mm D x 1970 mm H', 2.88::numeric, 4116::numeric, 'External battery options to verify', 'https://www.productinfo.schneider-electric.com/galaxyvx_iec/5ac775e546e0fb00011d8257/990-5783D%20Galaxy%20VX%201500%20kW%20Installation/English/990-5783%201500%20kW%20UPS%20Installation_0000088640.xml/%24/UPSWeightsandDimensionsREF_0000110736'),

    -- Schneider Electric Galaxy VXL
    ('Schneider Electric', 'Galaxy VXL', '500 kW', 500::numeric, 500::numeric, 'Up to 97.5% double conversion / 99% eConversion', '1200 mm W x 1000 mm D x 1970 mm H', 1.20::numeric, 851::numeric, 'Li-ion compatible / external battery options to verify', 'https://www.productinfo.schneider-electric.com/galaxyvxl_iec/990-55111_galaxy-vxl-ups-380-400-415-v-installation/English/990-55111%20Galaxy%20VXL%20500-1250%20kW%20400%20V%20Installation_0001114911.xml/%24/SpecificationsREF_0000000332'),
    ('Schneider Electric', 'Galaxy VXL', '750 kW', 750::numeric, 750::numeric, 'Up to 97.5% double conversion / 99% eConversion', '1200 mm W x 1000 mm D x 1970 mm H', 1.20::numeric, 957::numeric, 'Li-ion compatible / external battery options to verify', 'https://www.productinfo.schneider-electric.com/galaxyvxl_iec/990-55111_galaxy-vxl-ups-380-400-415-v-installation/English/990-55111%20Galaxy%20VXL%20500-1250%20kW%20400%20V%20Installation_0001114911.xml/%24/SpecificationsREF_0000000332'),
    ('Schneider Electric', 'Galaxy VXL', '1000 kW', 1000::numeric, 1000::numeric, 'Up to 97.5% double conversion / 99% eConversion', '1200 mm W x 1000 mm D x 1970 mm H', 1.20::numeric, 1063::numeric, 'Li-ion compatible / external battery options to verify', 'https://www.productinfo.schneider-electric.com/galaxyvxl_iec/990-55111_galaxy-vxl-ups-380-400-415-v-installation/English/990-55111%20Galaxy%20VXL%20500-1250%20kW%20400%20V%20Installation_0001114911.xml/%24/SpecificationsREF_0000000332'),
    ('Schneider Electric', 'Galaxy VXL', '1250 kW', 1250::numeric, 1250::numeric, 'Up to 97.5% double conversion / 99% eConversion', '1200 mm W x 1000 mm D x 1970 mm H', 1.20::numeric, 1169::numeric, 'Li-ion compatible / external battery options to verify', 'https://www.productinfo.schneider-electric.com/galaxyvxl_iec/990-55111_galaxy-vxl-ups-380-400-415-v-installation/English/990-55111%20Galaxy%20VXL%20500-1250%20kW%20400%20V%20Installation_0001114911.xml/%24/SpecificationsREF_0000000332'),

    -- Socomec DELPHYS XL
    ('Socomec', 'DELPHYS XL', '1000 kW', 1000::numeric, 1000::numeric, '97.1% VFI / 99.1% Smart Conversion', '2625 mm W x 1000 mm D x 2005 mm H', 2.63::numeric, 2600::numeric, 'VRLA / Lithium-ion', 'https://emea.socomec.com/sites/default/files/2024-08/DELPHYS-XL-HIGH-POWER-UPS---1200-KVA_KW_CATALOGUE---PAGES_2023-06_DCG00799_EN_2.pdf'),
    ('Socomec', 'DELPHYS XL', '1200 kW', 1200::numeric, 1200::numeric, '97.1% VFI / 99.1% Smart Conversion', '3003 mm W x 1000 mm D x 2005 mm H', 3.00::numeric, 3200::numeric, 'VRLA / Lithium-ion', 'https://emea.socomec.com/sites/default/files/2024-08/DELPHYS-XL-HIGH-POWER-UPS---1200-KVA_KW_CATALOGUE---PAGES_2023-06_DCG00799_EN_2.pdf'),

    -- Vertiv Liebert APM2
    ('Vertiv', 'Liebert APM2', '10 kW', 10::numeric, 10::numeric, 'Up to 97.5% double conversion; verify exact load point', '600 mm W x 1030 mm D x 2000 mm H', 0.62::numeric, 328::numeric, 'VRLA / Li-ion; verify internal/external battery arrangement', 'https://www.vertiv.com/49915c/globalassets/shared/vertiv-liebert-apm2-10-600kw-brochure-sl-71311.pdf'),
    ('Vertiv', 'Liebert APM2', '100 kW', 100::numeric, 100::numeric, 'Up to 97.5% double conversion; verify exact load point', '600 mm W x 1030 mm D x 2000 mm H', 0.62::numeric, 332::numeric, 'VRLA / Li-ion; verify internal/external battery arrangement', 'https://www.vertiv.com/49915c/globalassets/shared/vertiv-liebert-apm2-10-600kw-brochure-sl-71311.pdf'),
    ('Vertiv', 'Liebert APM2', '300 kW', 300::numeric, 300::numeric, 'Up to 97.5% double conversion; verify exact load point', '1200 mm W x 1030 mm D x 2000 mm H', 1.24::numeric, 638.5::numeric, 'VRLA / Li-ion; verify internal/external battery arrangement', 'https://www.vertiv.com/49915c/globalassets/shared/vertiv-liebert-apm2-10-600kw-brochure-sl-71311.pdf'),
    ('Vertiv', 'Liebert APM2', '600 kW', 600::numeric, 600::numeric, 'Up to 97.5% double conversion; verify exact load point', '1200 mm W x 1030 mm D x 2000 mm H', 1.24::numeric, 638.5::numeric, 'VRLA / Li-ion; verify internal/external battery arrangement', 'https://www.vertiv.com/49915c/globalassets/shared/vertiv-liebert-apm2-10-600kw-brochure-sl-71311.pdf'),

    -- Vertiv Liebert EXL S1
    ('Vertiv', 'Liebert EXL S1', '300 kW', 300::numeric, 300::numeric, 'Up to 97% VFI / up to 99% Dynamic Online', '1000 mm W x 900 mm D x 1950 mm H', 0.90::numeric, 725::numeric, 'VRLA / lithium-ion options to verify', 'https://www.vertiv.com/4995b4/globalassets/products/critical-power/uninterruptible-power-supplies-ups/liebert-80-exl-100-1200-kw-brochure-english.pdf'),
    ('Vertiv', 'Liebert EXL S1', '600 kW', 600::numeric, 600::numeric, 'Up to 97% VFI / up to 99% Dynamic Online', '1600 mm W x 900 mm D x 1950 mm H', 1.44::numeric, 1135::numeric, 'VRLA / lithium-ion options to verify', 'https://www.vertiv.com/4995b4/globalassets/products/critical-power/uninterruptible-power-supplies-ups/liebert-80-exl-100-1200-kw-brochure-english.pdf'),
    ('Vertiv', 'Liebert EXL S1', '800 kW', 800::numeric, 800::numeric, 'Up to 97% VFI / up to 99% Dynamic Online', '2000 mm W x 900 mm D x 1950 mm H', 1.80::numeric, 1550::numeric, 'VRLA / lithium-ion options to verify', 'https://www.vertiv.com/4995b4/globalassets/products/critical-power/uninterruptible-power-supplies-ups/liebert-80-exl-100-1200-kw-brochure-english.pdf'),
    ('Vertiv', 'Liebert EXL S1', '1000 kW', 1000::numeric, 1000::numeric, 'Up to 97% VFI / up to 99% Dynamic Online', '2650 mm W x 900 mm D x 1950 mm H', 2.39::numeric, 2275::numeric, 'VRLA / lithium-ion options to verify', 'https://www.vertiv.com/4995b4/globalassets/products/critical-power/uninterruptible-power-supplies-ups/liebert-80-exl-100-1200-kw-brochure-english.pdf'),
    ('Vertiv', 'Liebert EXL S1', '1200 kW', 1200::numeric, 1200::numeric, 'Up to 97% VFI / up to 99% Dynamic Online', '3250 mm W x 900 mm D x 1950 mm H', 2.93::numeric, 2625::numeric, 'VRLA / lithium-ion options to verify', 'https://www.vertiv.com/4995b4/globalassets/products/critical-power/uninterruptible-power-supplies-ups/liebert-80-exl-100-1200-kw-brochure-english.pdf')
)
INSERT INTO public.ups_ratings (
  product_id,
  rating_label,
  kva,
  kw,
  efficiency,
  dimensions,
  footprint_m2,
  weight_kg,
  battery_option,
  datasheet_url
)
SELECT
  pm.product_id,
  sr.rating_label,
  sr.kva,
  sr.kw,
  sr.efficiency,
  sr.dimensions,
  sr.footprint_m2,
  sr.weight_kg,
  sr.battery_option,
  sr.datasheet_url
FROM seed_ratings sr
JOIN product_map pm
  ON pm.vendor_name = sr.vendor_name
 AND pm.product_series = sr.product_series
ON CONFLICT (product_id, rating_label) DO UPDATE SET
  kva = EXCLUDED.kva,
  kw = EXCLUDED.kw,
  efficiency = EXCLUDED.efficiency,
  dimensions = EXCLUDED.dimensions,
  footprint_m2 = EXCLUDED.footprint_m2,
  weight_kg = EXCLUDED.weight_kg,
  battery_option = EXCLUDED.battery_option,
  datasheet_url = EXCLUDED.datasheet_url;