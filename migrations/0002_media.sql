CREATE TABLE media (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  alt TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  bytes INTEGER NOT NULL,
  public_id TEXT NOT NULL UNIQUE,
  cloud_name TEXT NOT NULL,
  version INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready' CHECK(status IN ('ready','deleting','deleted'))
);
-- Keep a media retirement and a concurrent draft/publish from crossing each other.
CREATE TRIGGER settings_media_insert BEFORE INSERT ON settings
WHEN EXISTS (
  SELECT 1 FROM json_tree(NEW.value) j WHERE j.type = 'text'
  AND j.value GLOB '/images/uploads/*.webp'
  AND NOT EXISTS (SELECT 1 FROM media WHERE '/images/uploads/' || id || '.webp' = j.value AND status = 'ready')
)
BEGIN SELECT RAISE(ABORT, 'An uploaded image is unavailable. Choose another image.'); END;
CREATE TRIGGER settings_media_update BEFORE UPDATE OF value ON settings
WHEN EXISTS (
  SELECT 1 FROM json_tree(NEW.value) j WHERE j.type = 'text'
  AND j.value GLOB '/images/uploads/*.webp'
  AND NOT EXISTS (SELECT 1 FROM media WHERE '/images/uploads/' || id || '.webp' = j.value AND status = 'ready')
)
BEGIN SELECT RAISE(ABORT, 'An uploaded image is unavailable. Choose another image.'); END;
CREATE TRIGGER media_upload_limit BEFORE INSERT ON media
WHEN (SELECT count(*) FROM media WHERE status != 'deleted') >= 250
BEGIN SELECT RAISE(ABORT, 'Uploaded image limit reached.'); END;
