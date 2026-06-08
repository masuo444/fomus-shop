-- Add slug column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Set slugs for all products
UPDATE products SET slug = 'masu-badge'            WHERE id = '819912f7-f33e-4702-a411-c19c3aff0082';
UPDATE products SET slug = 'massu-lecture-plan'    WHERE id = 'c80ee449-914f-4911-ab60-c1f6455648f2';
UPDATE products SET slug = 'fomus-masu'             WHERE id = 'c72a8669-00cf-4de3-8392-4ac0cba44502';
UPDATE products SET slug = 'mini-fomus-masu'        WHERE id = '69f72f51-46b3-43bc-a529-d8f998949c71';
UPDATE products SET slug = 'fomus-masu-10set'       WHERE id = 'a21af9f9-cf42-4b65-b92b-23c37097866a';
UPDATE products SET slug = 'mini-fomus-masu-10set'  WHERE id = '54425940-a86a-4ec8-87fe-d9d8b2e815a7';
UPDATE products SET slug = 'masu-lid-ichigo'        WHERE id = '6e4e8891-9432-465e-858f-21caee0616ce';
UPDATE products SET slug = 'masu-lid-mini'          WHERE id = 'e3d0b907-1ff2-455b-8793-7d6cf64e2b6d';
UPDATE products SET slug = 'masu-frame'             WHERE id = '51976ff3-9ed8-444e-82cc-e60fce54740e';
UPDATE products SET slug = 'masu-tower-100-ichigo'  WHERE id = '5870b136-dd50-421d-94a7-4e039d9063d4';
UPDATE products SET slug = 'masu-tower-100-mini'    WHERE id = 'd66f38a1-a32b-4151-8512-5119f5a292c9';
UPDATE products SET slug = 'masukame'               WHERE id = 'cf1827c5-f586-444b-9941-20fba37a0aaf';
UPDATE products SET slug = 'support-donation'       WHERE id = '902678d5-2686-4de0-ab66-69eef3e561e1';
UPDATE products SET slug = 'kubi-kake-masu'         WHERE id = '014c9c70-e7cd-4c3b-becb-36ff02526b6f';
UPDATE products SET slug = 'arabic-masu'            WHERE id = '067ca822-8fe6-4832-a60f-79b324c16024';
UPDATE products SET slug = 'fomus-running-wear'     WHERE id = 'cf96175b-23c4-41dc-8b4b-5db035903eaa';
UPDATE products SET slug = 'silva-card-game'        WHERE id = 'd9d3a0c9-1f39-4012-9c50-51c6a9a58819';
UPDATE products SET slug = 'zenryoku-ouen'          WHERE id = '900c6ead-15ca-4d0f-9719-451eaa41bcfc';
UPDATE products SET slug = 'bar-counter-sponsor'    WHERE id = 'b9a22cac-f900-4ed6-bd00-6719c8ffc3d6';
UPDATE products SET slug = 'car-sponsor'            WHERE id = '3b1d6fed-e06f-4aa0-ad6a-b218c33b6532';
UPDATE products SET slug = 'life-infra-sponsor'     WHERE id = '325ce97f-373a-4f93-b8d2-acbc5e69807d';
UPDATE products SET slug = 'ai-camp-1night'         WHERE id = 'fa81d38e-0da0-4554-b8b4-c973063dbb56';
UPDATE products SET slug = 'ai-consulting-2h'       WHERE id = 'ead6ae16-e0e1-47c6-84ba-62ce1d7a4fe0';
UPDATE products SET slug = 'ai-support-1month'      WHERE id = '74ab2c13-b208-412b-afa5-968f4fa4f7e2';
UPDATE products SET slug = 'gold-member-fuefuki'    WHERE id = 'af8982e5-bc64-4b2d-839f-23c0a08d39ef';
