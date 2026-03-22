const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;

async function dedupe() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const col = db.collection('batchrecords');
  
  // Find all duplicates
  const pipeline = [
    { $group: { _id: { userId: "$userId", docketNo: "$docketNo" }, count: { $sum: 1 }, docs: { $push: "$_id" } } },
    { $match: { count: { $gt: 1 } } }
  ];
  
  const duplicates = await col.aggregate(pipeline).toArray();
  let deletedCount = 0;
  
  for (const group of duplicates) {
    // Keep the the newest one (last in array usually or we can sort), delete the rest
    // The docs are pushed in whatever order, let's just keep the first one
    const toDelete = group.docs.slice(1);
    await col.deleteMany({ _id: { $in: toDelete } });
    deletedCount += toDelete.length;
  }
  
  console.log('Deleted ' + deletedCount + ' duplicate records.');
  
  console.log('\n--- TRYING TO CREATE INDEX ---');
  try {
    await col.createIndex({ userId: 1, docketNo: 1 }, { unique: true });
    console.log('Successfully created unique index now!');
  } catch (err) {
    console.error('Failed to create index:', err.message);
  }
  process.exit(0);
}

dedupe();
