---
title: "Adversarial review agents"
date: "2026-08-29" #YYYY-MM-DD
tags: ["Blog", "Professional", "AI"]
ogImage: "public/images/opengraph-image.png"
description: Keeping implementers and reviewers honest
---

## Anthropic rewrites Bun in Rust, with Claude

Recently, Anthropic shared the news that they had rewritten [Bun](https://bun.sh/blog/bun-in-rust) (a JavaScript framework they had acquired in December 2025) in Rust. This was achieved by using 64 instances of Claude, completing the work in 11 days across 6502 commits. Controversial for many reasons, for sure. The post is interesting and worth reading, but there was one part that did stand out to me which was how they used an adversarial review agent:

> Adversarial review asks Claude (in a separate context window) to exhaustively come up with reasons why the changes create bugs or do not work
The reviewer's only job: find bugs & reasons why the code does not work. The implementer doesn't review. The reviewer doesn't implement.
> 

This is interesting for getting a fresh set of eyes, so to speak, to review the changes that were made and find reasons why the code doesn’t work. In a way, it’s like a code review.

So I decided to go ahead and create my own adversarial review agent on Claude Code. Here’s the description of said agent:

> Use this agent when you need code scrutinised for bugs and reasons it will fail — not improved, refactored, or praised. It is an adversarial reviewer with a single job: find defects. It can be paired with a separate implementer agent (the reviewer never writes code; the implementer never reviews its own work) or run standalone against a diff, branch, PR, or file. Invoke it after code is written or changed, before merging, or whenever you want a hostile second opinion on whether something actually works.
> 

I hoped that this agent would do as described; only find bugs and reasons why the code fails. And I was curious in what this agent would find. If an agent which specialises in TypeScript, you would think that the agent wouldn’t make any mistakes and there wouldn’t be a need for an adversarial reviewer.

I took the agent for a test run against two of my existing projects that I extensively used Claude Code to create and maintain; the launch page and a stocks app.

## The Prism launch page

I recently attempted to launch a product myself, called Prism. It was going to be an application that allowed users to upload CSV files for instant analysis (graphs, an executive summary, and reports). I created a launch page to attract interest, but unfortunately, it failed to attract any sign ups. So I had to update the page with a message to say that sign ups were now closed.

So I dispatched agents to do the work by Claude Code, but the adversarial reviewer would check the work that was done.

Turns out the agent found several issues with the work that was done by the other agents:

> 
> 
> 
> The adversarial reviewer earned its keep — it found four real defects in the implementers' work, all now fixed and committed separately:
> 
> - CI would have gone red. The e2e "no buttons" assertion pierces shadow DOM and caught the Next.js DevTools overlay button that deno task dev injects. Scoped to <main>; verified 9/9 passing in a clean worktree, plus 9 repeats of the previously flaky spec.
> - The purge script could delete the wrong database and call it a success. An empty table exited 0 — indistinguishable from a real purge, and exactly what happens if you point at the Neon branch the docs suggest taking as a backup. It now refuses. The CONFIRM_PURGE=yes guard was also armable permanently from .env.local, the very file the task loads; it's now a --confirm argv flag that can't come from a file. It prints the target host and database before deleting.
> - The privacy notice contradicted itself — claimed the data was deleted, then described a live form and retained data in the present tense, and promised to email a waitlist that no longer exists. Rewritten.
> - The README told a future maintainer that src/components/sections/ is unreachable. /privacy imports Footer from it — deleting that directory would break the build.

The adversarial reviewer did exactly what it was supposed to, it scrutinised the code for bugs and found reasons why it would fail. The bugs were then fixed and the end result was a web page which had routes to my database on Neon removed (so nobody could send requests to it).

It was slightly surprising to see that the implementer caused these mistakes, and shows that AI isn’t perfect, and it will make mistakes. Validating what AI generates is important, and that we take ownership.

There comes the scenario of if the adversarial agent has the most recent up to date documentation available when it comes to working with frameworks or automated testing tools such as Playwright. So I updated the agent to call upon [context7](https://context7.com/) if needed. We need to remember that these models can only look backwards, they can’t look forwards. So using an MCP server can somewhat help bridge that gap.

## Claude Stocks App

This is an application that could do with some attention. I called upon my product owner agent to uncover some potential new features with the intention of developing one of them. The feature I picked was a new watchlist panel on the homepage. So I dispatched my agents (a TypeScript architect and a frontend craft agent), with the adversarial reviewer, and waited to see what if the code that was generated had any issues.

Turns out, it found *plenty* of issues what my agents have created.

> 
> 
> 
> Findings are in, and I independently verified the load-bearing ones. Suite state: 145 tests pass, and the new files typecheck clean (pre-existing tsc errors in StockChart.tsx and amazon-bdd.spec.ts only).
> 
> The three that should block a merge
> 
> 1. The route is an API-key amplifier (critical). checkRateLimit allows 30 req/min per IP per pathname, and parseSymbolsParam admits 20 symbols — so one IP can drive 600 Finnhub calls/minute against a free tier capped at 60, on a key every visitor shares. The route's own comment (route.ts:17-21) calls the shared cache "the primary protection," but that only holds if symbols repeat. SYMBOL_RE is /^[A-Z]{1,10}$/ — it doesn't check the ticker is real, and Finnhub returns HTTP 200 with c: 0 for unknown symbols, which line 106 deliberately doesn't cache. So bogus-but-valid symbols are re-fetched on every single request forever. The cache absorbs nothing on exactly the adversarial path. I confirmed the rate-limit numbers in lib/ratelimit.ts:2-3.
> 
> Worth noting how the siblings compare: /api/stock/quote is strictly 1-in-1-out, and /api/stock/movers fans out to 14 but behind a single movers:snapshot key. This is the first route where the per-IP limit doesn't bound upstream cost.
> 
> 1. mapWithConcurrencyLimit silently drops every item on a NaN limit (high). Math.max(1, Math.floor(NaN)) is NaN, not 1 — I verified this, plus that slice(0, NaN) returns empty. Result: [] returned with fn never called. In this route that means every uncached symbol degrades to an em-dash with nothing logged. The guard's own comment at concurrency.ts:28-29 claims to cover bad limits; it covers zero/negative/fractional and fails open on the worst one. CC-06 only tests 0.
> 2. Chunked ≠ pooled, and there's no timeout anywhere (high). finnhubFetch (lib/finnhub/client.ts:24) passes no signal. The chunked implementation awaits each chunk sequentially, so one slow call blocks all later chunks — the reviewer measured avg 1.00 in-flight against a limit of 5 when one item is slow. Route latency is the sum of per-chunk maxima, not the max. And WatchlistPanel has no AbortController and no in-flight guard, so the 60s interval stacks a second and third full 20-symbol request on top. That compounds #1.
> 
> Real but lower severity
> 
> - Stale-response overwrite — no generation counter; a slow t=0 response lands after a fast t=60s one and rewrites every symbol with older prices (WatchlistPanel.tsx:59-65). The "keyed by symbol" comment covers removed symbols, not out-of-order arrival for the same symbol.
> - Cross-tab adds show a 60s skeleton — on refocus, the hook's visibilitychange listener is registered first (guaranteed by the !hydrated → null mount order), but React batches its setSymbols, so the panel's listener fires fetchQuotes() reading a symbolsRef that's one render behind. The very invariant cited at :112-114 is what fails.
> - Cross-window sync doesn't work at all — there's no storage listener anywhere; visibilityState stays "visible" for a tab active in an unfocused window, so the documented intent at useWatchlistSymbols.ts:32-37 isn't delivered.
> - Ticker-tape cache claim is false — I grepped every setCached site: movers/route.ts:71 writes only movers:snapshot, never a quote: key. So route.ts:20-21 is wrong, and it's one of the two assumptions justifying the 20-way fan-out.
> - 429s swallowed with Retry-After ignored (diverges from PriceHeader, which it claims to mirror); duplicate localStorage symbols → duplicate React keys and a double-removal; removed symbols' quotes never pruned from state; the "no layout shift" claim in WatchlistSection conflates CLS with hydration mismatch.
> 
> On the tests you added yesterday
> 
> WL-15 and WL-16 are close to vacuous. WL-15 asserts SYMBOL_RE.source === "^[A-Z]{1,10}$" — a literal equalling itself — and its stated purpose (catching a lost export) is already enforced by the compiler via the import in watchlist-quotes-validation.ts:14. WL-16 guards a /g flag nobody proposed. CC-02 asserts only maxInFlight <= limit, which a fully sequential implementation also satisfies — it cannot detect finding #3.
> 
> Bigger gap: the route handler has zero tests, and no E2E seeds localStorage.watchlist, so the entire panel branch of WatchlistSection is unexercised end to end. Also worth knowing — deno task test runs with --no-check, so type regressions wouldn't fail the suite.
> 
> Verified clean
> 
> parseSymbolsParam handles ",", whitespace-only, and cap-after-dedup correctly. Order preservation in mapWithConcurrencyLimit is genuine, so the index → missing[index] mapping is sound. No URL-encoding gap. QuoteDisplay's null guards do protect the formatters. Interval lifecycle doesn't stack or leak on unmount. And the isMarketOpen cross-route cache concern I flagged turned out to be a non-issue — both routes compute it identically at write time with the same TTL.
> 
> Want me to start fixing? I'd sequence it as: bound the upstream cost (#1) — probably a cache-negative-results change plus a symbol-count-aware limit — then the NaN guard and a fetch timeout, then the client-side race and in-flight guard. #1 is the only one I'd call a genuine merge blocker.
> 

So I asked Claude to fix the issues, with the adversarial reviewer paired with them, so that the cycle can begin again. This time, the adversarial reviewer was examining the fixes that were made and see what they broke or failed to fix.

And the reviewer continued to prove it’s weight in gold:

> 
> 
> 
> The reviewer disproved two of my hypotheses
> 
> I was wrong about the double-fetch on mount. It captured JS stack traces and showed the second request comes from React StrictMode's dev-only double-invoke of the mount effect — the [symbols] effect is innocent, because prevSymbolSetRef is seeded with the initial symbols and the panel only ever mounts non-empty. It confirmed this by counting /api/stock/movers, where TickerTape has an identical unguarded mount fetch and fires once. That's a real control.
> 
> It also verified rather than trusted the CC-02 claim: it reconstructed the old chunked implementation and ran the new test against it, which fails with startedWhileSlowRunning = 3 against a required 12. The worker pool is genuinely correct — order, settled semantics, sync throws, cursor race, non-finite clamping all check out.
> 
> What the fixes broke
> 
> The per-symbol degradation path defeats every protection the client has. These three compound into one user-visible failure:
> 
> 1. A status: "error" row overwrites an already-good price with an em-dash, silently — the "keep last-known data" contract only ever covered total fetch failure, and the server workstream just made per-symbol degradation routine.
> 2. A budget-denied cold start returns HTTP 200 with 20 error rows, so the client takes the success path: fetchError stays null, quotes.size becomes 20, and showTerminalError is false. The quotes.size === 0 gate is defeated by the very rows that represent the failure.
> 3. MAX_UPSTREAM_CALLS_GLOBAL = 30 means one cold user with 20 symbols eats 20 of 30. The cliff is ~1.5 cold users per minute for the entire deployment.
> 
> Net result: at trivial concurrency the watchlist shows no prices and never says why. That's worse than the original bug.
> 
> Two budget-accounting defects: deadline-starved symbols get negative-cached for 10s despite never being contacted — and near the boundary, Math.min(4000, 10) actually sends the request before aborting it 10ms later, burning quota and poisoning the symbol. The code's own docstring states the rule ("Deferred symbols must NOT be negative-cached") and applies it to the budget path but not the deadline path. Separately, reserved-but-unspent tokens are never refunded — there's no release API at all.
> 
> Also confirmed: a stale c:0 entry written by /api/stock/quote short-circuits lookupSymbol so the negative cache is unreachable and the symbol costs a fresh upstream call every request; getClientIp returning "unknown" without a trusted proxy collapses all visitors into one 20-req/25-call bucket; the h-9 placeholder creates a ~28px jump for first-time visitors (the majority case) where null previously shifted nothing; plus the 429 banner text inverting at expiry, an invisible 1Hz re-render, and 2 new lint errors.
> 
> One informational finding worth weighing: deno task build fails on the pre-existing StockChart.tsx typing error, so none of this has ever run against a production build — every conclusion here, mine included, rests on dev-server behaviour.
> 

The reviewer found that the fixes broke functionality, and it does go to show that having a separate agent review work done and investigate why the code doesn’t work is extremely useful.

So the agents were once again sent to fix the issues that the reviewer found.

And it found *more* defects with the code

> We're three review rounds in and still finding High-severity defects, though each round's findings are narrower than the last. The unchanged caveat: deno task build fails on a pre-existing StockChart.tsx typing error, so none of this has ever run against a production build — that's a two-line fix outside this feature and I'd want it done before merge, since every conclusion here rests on dev-server behaviour.
> 

The relevant agents were dispatched, *again*. Maybe this time there wouldn’t be any issues found.

And then something odd happened.

*My agents began to disagree with the reviewer.*

> 
> 
> 
> The server agent declined defect 7 (single-flight dedup), and its reasoning is worth reading. It argued the fix wouldn't even work as specified — budget reservation and allocation both run before dispatch, so the surplus rows are deferred regardless of what's in flight; recovering them needs dedup visible at partition time. And a shared in-flight promise would hand the originator's AbortController to joiners, so a joiner with 4s of deadline attaching to a flight opened with 260ms left inherits the abort and gets negative-cached as "failed" — reintroducing exactly the bug round 2 existed to kill. It also named the honest root cause: this is all per-instance module memory, and a shared cache would solve both this and the budget-per-instance problem properly.
> 
> That's a declined task with better reasoning than most completed ones, but I've asked the reviewer to judge it rather than accept it — a well-argued decline is also what skipping work looks like.
> 

This was unexpected. It’s interesting how this happened and the agent gave a reason why.

After the reviewer went ahead and judged the fixes, it gave a response regarding defect 7:

> 
> 
> 
> The reviewer's verdict: safe to merge. Nothing in the branch's own code blocks it. It cleared the round-3 work item by item with evidence — the hasAnyDisplayablePrice fix genuinely closes the hole with no flap, the .slice() read cap can't desync or resurrect a truncated tail, the pinned-key set is bounded at ≤2 constants against a cap of 32, and it independently reproduced the client's mutation-testing claim on an isolated copy.
> 
> It also judged the declined single-flight work and found the reasoning sound, with one honest correction: dedup would still cut real Finnhub spend even without recovering deferred rows — but since the binding constraint is charged at reservation regardless, it buys no extra throughput. Declining holds at these caps.
> 

I didn’t anticipate that this would happen, and the way it handled and judged the response took me by surprise a little. Using the reviewer ended up pushing for better quality and discussion.

The final result was that the finished feature was working as expected. It’s quite terrifying that I can type out what I want, let the agents work together, and the finished feature is ready for me to look at. And honestly, I would say 8/10 times there wouldn’t be any major issues with either the functionality or the UI that would need fixing. For those times that there are, Claude can fix them quickly.

## Another step in AI agents ensuring quality code?

Back in March, I wrote a lengthy post about AI and the impact it will have on us. I still stand by my view that the next twelve months is going to be incredibly important, and I think the advancements (for better or for worse) we’ve seen so far this year just cements that this technology isn’t going anywhere. If anything, it seems that 2027 might be the year when we start to see the implications on our careers and livelihoods.

Right now, Human Subject Matter Experts are still important. From areas such as software development, to business analytics and intelligence, we provide the crucial context that is needed for these models to deliver an output than can be reviewed and accepted by a human. But for how long this will last is unknown.

If these types of agents can push for better quality of code without me intervening through manual testing, then there is a strong possibility that I could be out of a job in the near future. However, there is one downside to this particular agent is that the review cycle can burn through tokens at a terrifying rate. Especially if the review cycle has to be repeated, you’ll find that you can definitely hit usage limits pretty quickly.

This was a fun experiment, and definitely a glimpse into the future of what agentic development holds. If you are curious in creating your own adversarial review agent, you can use the description I provided at the top as a starting point. You might be taken by surprise at how effective it is.
