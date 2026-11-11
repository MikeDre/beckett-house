DROP TRIGGER page_revision_initial;
DROP TRIGGER page_revision_publish;
CREATE TRIGGER page_revision_initial AFTER INSERT ON settings
WHEN NEW.key IN ('page:home','page:angel','page:abbey-road','page:faq','page:about','page:timetable','page:history')
BEGIN
 INSERT INTO page_revisions VALUES(substr(NEW.key,6),0,json_extract(NEW.value,'$.published'),NULL,NULL);
END;
CREATE TRIGGER page_revision_publish AFTER UPDATE OF value ON settings
WHEN NEW.key IN ('page:home','page:angel','page:abbey-road','page:faq','page:about','page:timetable','page:history')
 AND json_extract(NEW.value,'$.publishedAt') IS NOT json_extract(OLD.value,'$.publishedAt')
BEGIN
 INSERT INTO page_revisions VALUES(substr(NEW.key,6),json_extract(NEW.value,'$.version'),json_extract(NEW.value,'$.published'),json_extract(NEW.value,'$.publishedAt'),NEW.updated_by);
 DELETE FROM page_revisions WHERE page=substr(NEW.key,6) AND version NOT IN (SELECT version FROM page_revisions WHERE page=substr(NEW.key,6) ORDER BY version DESC LIMIT 50);
END;
