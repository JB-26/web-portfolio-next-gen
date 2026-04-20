#!/usr/bin/env node
/**
 * One-shot migration script for the `comments` table.
 *
 * Usage:
 *   vercel env pull .env.local   # once, to get DATABASE_URL locally
 *   node --env-file=.env.local scripts/migrate-comments.mjs
 *
 * The script is idempotent — it uses `CREATE ... IF NOT EXISTS` throughout,
 * so it is safe to re-run. Reads `DATABASE_URL` from the environment (the
 * standard Neon / Vercel–Neon integration variable). Exits with status 1
 * if the env var is missing or any SQL statement fails.
 */
import { neon } from "@neondatabase/serverless";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "[migrate-comments] DATABASE_URL is not set. Run `vercel env pull .env.local` or export it manually.",
    );
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("[migrate-comments] Applying comments schema...");

  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id    TEXT NOT NULL,
      author     TEXT NOT NULL,
      body       TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      status     TEXT NOT NULL DEFAULT 'approved'
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS comments_post_id_created_at_idx
      ON comments (post_id, created_at DESC) WHERE status = 'approved';
  `;

  console.log("[migrate-comments] Success.");
}

main().catch((err) => {
  console.error("[migrate-comments] Failed:", err);
  process.exit(1);
});
