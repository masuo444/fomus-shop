-- Add keyword-rich descriptions to products with empty/null descriptions
-- Targets: FOMUS枡(fomus-masu), ミニFOMUS枡(mini-fomus-masu), and 10個セット products

UPDATE products
SET description = '国産ヒノキを使用した一合枡（180ml）。FOMUSのオリジナルデザインが焼印で刻まれた、日本酒・クラフトビール・お茶にも使えるヒノキ枡です。使うほどに木の表情が変わる経年美をお楽しみください。食洗機不可・手洗いでお手入れください。'
WHERE slug = 'fomus-masu' AND (description IS NULL OR description = '');

UPDATE products
SET description = 'FOMUSオリジナルのミニ枡。コンパクトサイズで日本酒の利き猪口にも、アクセサリー入れにも。国産ヒノキの香りと温もりを手のひらサイズで楽しめます。名入れ・レーザー刻印のオーダーメイドにも対応。'
WHERE slug = 'mini-fomus-masu' AND (description IS NULL OR description = '');

UPDATE products
SET description = 'FOMUS枡10個セット。開店祝い・結婚式の引き出物・法人ノベルティなどまとめてのご注文に。国産ヒノキの一合枡（180ml）×10個。レーザー刻印での名入れも承ります（別途お見積り）。'
WHERE slug = 'fomus-masu-10set' AND (description IS NULL OR description = '');

UPDATE products
SET description = 'ミニFOMUS枡10個セット。プチギフト・ノベルティ・イベント配布用にまとめてどうぞ。国産ヒノキのコンパクト枡×10個セット。'
WHERE slug = 'mini-fomus-masu-10set' AND (description IS NULL OR description = '');
