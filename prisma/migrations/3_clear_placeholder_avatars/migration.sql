-- Placeholder picsum.photos avatar URLs were seeded for demo authors. They are
-- random stock images (and can fail to load / be blocked by CSP), which looks
-- unprofessional. Clear them so any author without a real uploaded photo falls
-- back to the branded FixPedia default avatar. Real Cloudinary uploads are kept.
UPDATE "User"
SET "avatarUrl" = NULL
WHERE "avatarUrl" LIKE '%picsum.photos%';
