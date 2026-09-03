export interface DojoChallenge {
  id: string;
  title: string;
  difficulty: "Intro" | "Core" | "Advanced";
  minutes: number;
  blurb: string;
  functional: string[];
  nonFunctional: string[];
  keyConcepts: string[];
}

export const DOJO_FRAMEWORK = [
  { step: 1, name: "Clarify", focus: "Pin down functional and non-functional requirements; ask the sharp questions an interviewer expects." },
  { step: 2, name: "Estimate", focus: "Back-of-envelope math: users, QPS, storage, bandwidth. Show your units." },
  { step: 3, name: "Model", focus: "API surface and data schema. Pick SQL vs NoSQL and defend the choice." },
  { step: 4, name: "Architect", focus: "High-level diagram: clients, services, stores, queues, caches. Trace one request end-to-end." },
  { step: 5, name: "Scale", focus: "Bottlenecks, sharding, replication, failure modes. What breaks at 10x?" },
];

export const DOJO_CHALLENGES: DojoChallenge[] = [
  {
    id: "url-shortener",
    title: "URL Shortener",
    difficulty: "Intro",
    minutes: 30,
    blurb: "The classic warm-up: turn long URLs into short links that survive massive read traffic.",
    functional: [
      "Shorten a URL and return a short alias",
      "Redirect a short alias to the original URL",
      "Optional custom aliases and expiration",
    ],
    nonFunctional: [
      "100:1 read-to-write ratio at 500M new URLs/month",
      "Redirect latency under 100ms p95",
      "High availability — redirects must not fail",
    ],
    keyConcepts: ["hash", "base62", "key-value", "cache", "read replica", "collision"],
  },
  {
    id: "rate-limiter",
    title: "Distributed Rate Limiter",
    difficulty: "Intro",
    minutes: 30,
    blurb: "Protect a fleet of services from traffic spikes with a shared, low-latency limiter.",
    functional: [
      "Limit requests per user/IP per window",
      "Return clear reject signals with retry hints",
      "Configurable rules per endpoint",
    ],
    nonFunctional: [
      "Sub-millisecond check on the hot path",
      "Consistent counts across many app servers",
      "Limiter itself must never be the bottleneck",
    ],
    keyConcepts: ["token bucket", "sliding window", "redis", "atomic", "local cache", "clock skew"],
  },
  {
    id: "chat-system",
    title: "Real-Time Chat System",
    difficulty: "Core",
    minutes: 45,
    blurb: "Deliver one-to-one and group messages with delivery guarantees and presence.",
    functional: [
      "One-to-one and group messaging",
      "Delivery/read receipts and typing indicators",
      "Message history with pagination",
    ],
    nonFunctional: [
      "Message delivery in under 500ms when online",
      "Exactly-once ordering per conversation",
      "Offline users receive backlog on reconnect",
    ],
    keyConcepts: ["websocket", "queue", "sequence", "fanout", "presence", "inbox"],
  },
  {
    id: "news-feed",
    title: "News Feed",
    difficulty: "Core",
    minutes: 45,
    blurb: "Build the feed: posts, follows, and a ranking pipeline that stays fast at celebrity scale.",
    functional: [
      "Publish posts with text and media",
      "Follow authors; home feed of followed authors",
      "Ranked feed with recency and engagement",
    ],
    nonFunctional: [
      "Feed loads under 300ms p95",
      "Celebrities with 100M followers must not break fanout",
      "Fresh content within seconds of posting",
    ],
    keyConcepts: ["fanout", "push", "pull", "timeline", "ranking", "cache", "celebrity"],
  },
  {
    id: "ride-matching",
    title: "Ride Matching",
    difficulty: "Advanced",
    minutes: 60,
    blurb: "Match riders with nearby drivers in real time across a dense city grid.",
    functional: [
      "Riders request rides; drivers accept",
      "Geo-matched nearest available drivers",
      "Live trip tracking and ETA updates",
    ],
    nonFunctional: [
      "Match decisions within 3 seconds",
      "Millions of live location updates per minute",
      "Surge-aware pricing and fairness",
    ],
    keyConcepts: ["geohash", "quadtree", "location", "shard", "matching", "websocket", "surge"],
  },
  {
    id: "video-streaming",
    title: "Video Streaming Platform",
    difficulty: "Advanced",
    minutes: 60,
    blurb: "Upload, transcode, and stream video to a global audience without buffering.",
    functional: [
      "Upload and transcode videos into renditions",
      "Adaptive bitrate streaming with seek",
      "View counts and basic analytics",
    ],
    nonFunctional: [
      "Start playback within 2 seconds worldwide",
      "Handle a viral spike of 10M concurrent viewers",
      "Durable storage with regional availability",
    ],
    keyConcepts: ["cdn", "transcode", "chunk", "hls", "adaptive bitrate", "origin", "cache"],
  },
];

export function findChallenge(id: string): DojoChallenge | undefined {
  return DOJO_CHALLENGES.find((c) => c.id === id);
}
