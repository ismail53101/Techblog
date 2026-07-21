-- Seed a sensible default for the GitHub social link (the repository owner's
-- profile) so at least one social icon is live immediately. It is fully
-- editable from Admin → Settings → Social Links, and clearing it hides the icon.
-- Other platforms (YouTube, X, Facebook, LinkedIn) intentionally start empty
-- and stay hidden until configured.
INSERT INTO "SiteSetting" ("id", "key", "value", "updatedAt")
VALUES (gen_random_uuid()::text, 'social_github', 'https://github.com/ismail53101', now())
ON CONFLICT ("key") DO NOTHING;
