// Force the deterministic mock AI provider for the whole test suite.
// Imported first (before anything pulls in src/config/env.ts) so dotenv — which
// never overrides an already-set process.env value — sees blank Gemini keys and
// aiMode() resolves to "mock". Without this, tests would call live Gemini off
// server/.env, making them slow and flaky against free-tier latency/quota.
process.env.GEMINI_API_KEY = "";
process.env.GEMINI_API_KEY_2 = "";
