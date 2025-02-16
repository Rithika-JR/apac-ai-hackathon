import { MongoClient } from 'mongodb';

let db;

async function connect() {
  const uri = process.env.MONGODB_URI 
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    db = client.db('content_store'); 
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); 
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}

export default { connect, getDb };
