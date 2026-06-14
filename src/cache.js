const { createClient }=require('redis');

const client=createClient({ url: process.env.REDIS_URL });

client.on('error', err=>console.error('Redis error:', err));

client.connect()
  .then(()=>console.log('Redis connected'))
  .catch(err=>console.error('Redis connection failed:', err));

async function getCache(key) {
  return await client.get(key);
}

async function setCache(key, value, ttl = 86400) {
  // TTL=86400 seconds=24 hours
  // Probabilistic early expiry prevents cache stampede
  const jitter= Math.floor(Math.random() * 3600);
  await client.setEx(key, ttl - jitter, value);
}

async function deleteCache(key) {
  await client.del(key);
}

module.exports={ getCache, setCache, deleteCache };