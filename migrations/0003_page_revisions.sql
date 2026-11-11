CREATE TABLE page_revisions (
 page TEXT NOT NULL,
 version INTEGER NOT NULL,
 content TEXT NOT NULL CHECK(json_valid(content)),
 published_at TEXT,
 published_by TEXT,
 PRIMARY KEY(page, version)
);
-- Earlier publications cannot be reconstructed. Preserve the current live copy.
INSERT INTO page_revisions(page,version,content,published_at,published_by)
SELECT substr(key,6),json_extract(value,'$.version'),json_extract(value,'$.published'),json_extract(value,'$.publishedAt'),NULL
FROM settings WHERE key IN ('page:home','page:angel','page:abbey-road','page:faq','page:about') AND json_valid(value) AND json_type(value,'$.published')='object';
-- A first draft also preserves the original website content before the first publish.
CREATE TRIGGER page_revision_initial AFTER INSERT ON settings
WHEN NEW.key IN ('page:home','page:angel','page:abbey-road','page:faq','page:about')
BEGIN
 INSERT INTO page_revisions VALUES(substr(NEW.key,6),0,json_extract(NEW.value,'$.published'),NULL,NULL);
END;
CREATE TRIGGER page_revision_publish AFTER UPDATE OF value ON settings
WHEN NEW.key IN ('page:home','page:angel','page:abbey-road','page:faq','page:about')
 AND json_extract(NEW.value,'$.publishedAt') IS NOT json_extract(OLD.value,'$.publishedAt')
BEGIN
 INSERT INTO page_revisions VALUES(substr(NEW.key,6),json_extract(NEW.value,'$.version'),json_extract(NEW.value,'$.published'),json_extract(NEW.value,'$.publishedAt'),NEW.updated_by);
 DELETE FROM page_revisions WHERE page=substr(NEW.key,6) AND version NOT IN (SELECT version FROM page_revisions WHERE page=substr(NEW.key,6) ORDER BY version DESC LIMIT 50);
END;
