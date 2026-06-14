const { Pool }=require('pg');
const mongoose=require('mongoose');

// PostgreSQL
const pool=new Pool({
  connectionString: process.env.POSTGRES_URL
});

pool.connect()
  .then(()=>console.log('PostgreSQL connected'))
  .catch(err=>console.error('PostgreSQL error:', err));

// MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(()=>console.log('MongoDB connected'))
  .catch(err=> console.error('MongoDB error:', err));

// MongoDB schema for click analytics
const clickSchema=new mongoose.Schema({
  shortCode: String,
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String
});

const Click=mongoose.model('Click', clickSchema);

module.exports ={ pool, Click };