const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (process.env.VERCEL) {
      console.error(`MongoDB connection failed: ${error.message}`);
      return;
    }

    console.warn(`MongoDB unavailable at ${process.env.MONGO_URI}, using in-memory database.`);

    try {
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      const memoryConn = await mongoose.connect(uri);
      console.log(`MongoDB Connected (Memory): ${memoryConn.connection.host}`);
    } catch (memError) {
      console.error(`Memory DB Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
