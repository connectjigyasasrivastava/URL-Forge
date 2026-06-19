const rateLimiter = require('./rateLimiter');
const express = require('express');
const router = express.Router();
const { generateSnowflakeId, toBase62 } = require('./snowflake');
const { pool, Click } = require('./db');
const { getCache, setCache } = require('./cache');
const { registerUser, loginUser } = require('./auth');
const { authenticateToken } = require('./middleware');

// POST /register
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await registerUser(username, password, role);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const token = await loginUser(username, password);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// POST /shorten — create a short URL
router.post('/shorten', rateLimiter, async (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) return res.status(400).json({ error: 'URL required' 
});

  try {
    const id = generateSnowflakeId();
    const shortCode = toBase62(id);

    await pool.query(
      'INSERT INTO urls (short_code, original_url, created_at) VALUES ($1, $2, NOW())',
      [shortCode, originalUrl]
    );

    await setCache(shortCode, originalUrl);

    res.json({ shortCode, shortUrl: `http://localhost:3000/${shortCode}` 
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /:code — redirect to original URL
router.get('/:code', async (req, res) => {
  const { code } = req.params;

  try {
    const cached = await getCache(code);
    if (cached) {
      await Click.create({ shortCode: code, ip: req.ip, userAgent: 
req.headers['user-agent'] });
      return res.redirect(302, cached);
    }

    const result = await pool.query(
      'SELECT original_url FROM urls WHERE short_code = $1',
      [code]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 
'URL not found' });

    const originalUrl = result.rows[0].original_url;
    await setCache(code, originalUrl);
    await Click.create({ shortCode: code, ip: req.ip, userAgent: 
req.headers['user-agent'] });

    return res.redirect(302, originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /analytics/:code — get click count
router.get('/analytics/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const count = await Click.countDocuments({ shortCode: code });
    res.json({ shortCode: code, clicks: count });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
