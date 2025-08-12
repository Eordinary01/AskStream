const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const authRoutes = require('./routes/auth');
const organizationRoutes = require('./routes/organizations');
const questionRoutes = require('./routes/questions');




const app = express();

const allowedOrigins = [
  "http://localhost:3000", // Local frontend
  "https://ask-streamfrontend.vercel.app" // When deployed
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
  })
);

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));



  app.get('/',(req,res)=>{
    res.json({message:"Dev has Arrived!!"})
  })

  app.use('/api/auth',authRoutes);
  app.use('/api/organizations',organizationRoutes);
  app.use('/api/questions',questionRoutes);


  const PORT = process.env.PORT || 8880;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));