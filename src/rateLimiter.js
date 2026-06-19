// Token bucket rate limiter — 500 requests/min per user
const buckets = new Map();

const MAX_TOKENS = 500;
const REFILL_RATE = MAX_TOKENS / 60; // tokens added per second

function getBucket(userId) {
  if (!buckets.has(userId)) {
    buckets.set(userId, { tokens: MAX_TOKENS, lastRefill: Date.now() });
  }
  return buckets.get(userId);
}

function refill(bucket) {
  const now = Date.now();
  const elapsedSeconds = (now - bucket.lastRefill) / 1000;
  const tokensToAdd = elapsedSeconds * REFILL_RATE;

  bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;
}

function rateLimiter(req, res, next) {
  const userId = req.user ? req.user.id : req.ip; // fallback to IP if unauthenticated

  const bucket = getBucket(userId);
  refill(bucket);

  if (bucket.tokens < 1) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });
  }

  bucket.tokens -= 1;
  next();
}

module.exports = rateLimiter;
