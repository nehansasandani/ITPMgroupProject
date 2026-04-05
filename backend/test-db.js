import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Rating from './models/Rating.js';
import Reputation from './models/Reputation.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const ratings = await Rating.find({ ratedUserId: "64f832b1f1234567890abcde" });
  const rep = await Reputation.findOne({ userId: "64f832b1f1234567890abcde" });
  
  const result = {
    ratingsCount: ratings.length,
    lastRating: ratings.length > 0 ? ratings[ratings.length - 1] : null,
    reputation: rep
  };
  
  fs.writeFileSync('db-dump.json', JSON.stringify(result, null, 2));
  process.exit();
}

check().catch(console.error);
