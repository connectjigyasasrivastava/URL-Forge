require('dotenv').config();
const express=require('express');
const app=express();

app.use(express.json());

const routes=require('./routes');
app.use('/', routes);

const PORT=process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`URL Forge running on port ${PORT}`);
});