require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
console.log("Attempting to connect to MongoDB...");

mongoose.set('strictQuery', false);
mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed!');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    process.exit(1);
  });

// Set a timeout
setTimeout(() => {
  console.error("❌ Connection timed out after 10 seconds");
  process.exit(1);
}, 10000);
