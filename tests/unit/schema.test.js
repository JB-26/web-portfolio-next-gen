/**
 * SC — NewCommentSchema unit tests
 *
 * Covers cases SC-01 through SC-15 from the QA Test Plan.
 * Import source: lib/comments/schema (TS Architect owns the implementation).
 *
 * NewCommentSchema: z.ZodObject
 *   Validates the payload for POST /api/comments.
 *   Fields: postId (string), author (string, max 60 chars), body (string, max 1000 chars).
 *   Refinement: body must not contain links (delegated to hasLinks()).
 *   Unknown fields are stripped (z.object default, or .strip()).
 */

import { describe, expect, test } from "vitest";
import { NewCommentSchema } from "../../lib/comments/schema.js";

/** Helper — returns the success data or throws to fail the test clearly. */
function mustParse(payload) {
  const result = NewCommentSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(
      `Expected valid payload to parse, got: ${JSON.stringify(result.error.flatten())}`
    );
  }
  return result.data;
}

/** Helper — asserts the payload is invalid and returns the flattened errors. */
function mustFail(payload) {
  const result = NewCommentSchema.safeParse(payload);
  expect(result.success, "Expected safeParse to fail but it succeeded").toBe(false);
  return result.error.flatten();
}

describe("NewCommentSchema", () => {
  // --- Happy path ---

  // SC-01: minimal valid payload
  test("SC-01: accepts minimal valid payload", () => {
    const data = mustParse({
      postId: "2024-01-15-my-post",
      author: "Alice",
      body: "Great post!",
    });
    expect(data.postId).toBe("2024-01-15-my-post");
    expect(data.author).toBe("Alice");
    expect(data.body).toBe("Great post!");
  });

  // SC-02: body at exactly 1000 chars (boundary — should pass)
  test("SC-02: accepts body of exactly 1000 characters (upper boundary)", () => {
    const body = "a".repeat(1000);
    const data = mustParse({ postId: "post-1", author: "Bob", body });
    expect(data.body).toHaveLength(1000);
  });

  // SC-03: body of 1 char (lower boundary — should pass)
  test("SC-03: accepts body of 1 character (lower boundary)", () => {
    mustParse({ postId: "post-1", author: "Bob", body: "x" });
  });

  // SC-04: author at exactly 60 chars (boundary — should pass)
  test("SC-04: accepts author name of exactly 60 characters (upper boundary)", () => {
    const author = "A".repeat(60);
    const data = mustParse({ postId: "post-1", author, body: "Hello" });
    expect(data.author).toHaveLength(60);
  });

  // --- Boundary failures ---

  // SC-05: body of 1001 chars (one over — should fail)
  test("SC-05: rejects body of 1001 characters (one over boundary)", () => {
    const errors = mustFail({
      postId: "post-1",
      author: "Bob",
      body: "a".repeat(1001),
    });
    expect(JSON.stringify(errors)).toMatch(/body/i);
  });

  // SC-06: author of 61 chars (one over — should fail)
  test("SC-06: rejects author name of 61 characters (one over boundary)", () => {
    const errors = mustFail({
      postId: "post-1",
      author: "A".repeat(61),
      body: "Hello",
    });
    expect(JSON.stringify(errors)).toMatch(/author/i);
  });

  // --- Required field failures ---

  // SC-07: missing body field
  test("SC-07: rejects payload missing body", () => {
    const errors = mustFail({ postId: "post-1", author: "Alice" });
    expect(errors.fieldErrors).toHaveProperty("body");
  });

  // SC-08: missing author field
  test("SC-08: rejects payload missing author", () => {
    const errors = mustFail({ postId: "post-1", body: "Hello" });
    expect(errors.fieldErrors).toHaveProperty("author");
  });

  // SC-09: missing postId field
  test("SC-09: rejects payload missing postId", () => {
    const errors = mustFail({ author: "Alice", body: "Hello" });
    expect(errors.fieldErrors).toHaveProperty("postId");
  });

  // --- Whitespace / empty string ---

  // SC-10: whitespace-only body should fail (Zod .min(1) after .trim(), or refinement)
  test("SC-10: rejects whitespace-only body", () => {
    mustFail({ postId: "post-1", author: "Alice", body: "   " });
  });

  // SC-11: empty string body
  test("SC-11: rejects empty string body", () => {
    mustFail({ postId: "post-1", author: "Alice", body: "" });
  });

  // SC-12: whitespace-only author
  test("SC-12: rejects whitespace-only author", () => {
    mustFail({ postId: "post-1", author: "   ", body: "Hello" });
  });

  // --- Link refinement ---

  // SC-13: body containing https:// link should fail
  test("SC-13: rejects body containing an https:// URL", () => {
    mustFail({
      postId: "post-1",
      author: "Alice",
      body: "Visit https://spam.com for free stuff",
    });
  });

  // SC-14: body containing a bare TLD pattern should fail
  test("SC-14: rejects body containing a bare domain (bare TLD pattern)", () => {
    mustFail({
      postId: "post-1",
      author: "Alice",
      body: "Check out spam.io today",
    });
  });

  // --- Unknown field stripping ---

  // SC-15: unknown fields are stripped and do not appear in parsed output
  test("SC-15: strips unknown fields from parsed output", () => {
    const data = mustParse({
      postId: "post-1",
      author: "Alice",
      body: "Great post!",
      honeypot: "bot-value",
      injected: "extra",
    });
    expect(data).not.toHaveProperty("honeypot");
    expect(data).not.toHaveProperty("injected");
  });
});
