-- Add item_category to digital_items
ALTER TABLE digital_items
  ADD COLUMN item_category TEXT NOT NULL DEFAULT 'collectible'
  CHECK (item_category IN ('collectible', 'ticket', 'art', 'other'));

-- Add created_by to digital_items for user-submitted items
ALTER TABLE digital_items
  ADD COLUMN created_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN digital_items.item_category IS 'Category: collectible, ticket, art, other';
COMMENT ON COLUMN digital_items.created_by IS 'User who created this item (NULL = admin-created)';
