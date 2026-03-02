const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    // Attempt to connect to the real persistent database first
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n⚠️  WARNING: Could not connect to local MongoDB database at ${process.env.MONGO_URI}. Is MongoDB installed and running?`);
    console.warn(`⚠️  Falling back to temporary In-Memory Database to keep the server running...\n`);

    try {
      // Fallback to Memory Database
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      const memoryConn = await mongoose.connect(uri);
      console.log(`MongoDB Connected (Temporary Memory DB): ${memoryConn.connection.host}`);
    } catch (memError) {
      console.error(`Memory DB Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
