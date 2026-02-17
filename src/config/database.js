import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const mongoURI = process.env.MONGODB_URI;
    const localURI = 'mongodb://localhost:27017/paaso';

    console.log('🔄 Connecting to MongoDB...');
    
    let conn;
    try {
      // Try Atlas connection first
      console.log(' Attempting Atlas connection...');
      conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
      });
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (atlasError) {
      console.log('⚠️ Atlas connection failed, trying local MongoDB...');
      console.log('💡 Error:', atlasError.message);
      
      // Fallback to local MongoDB
      try {
        conn = await mongoose.connect(localURI, {
          serverSelectionTimeoutMS: 3000,
          socketTimeoutMS: 45000,
        });
        console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
        console.log('💡 Using local database for development');
      } catch (localError) {
        console.error('\n❌ Both Atlas and Local MongoDB failed!');
        console.error('\n📋 Atlas Error:', atlasError.message);
        console.error('📋 Local Error:', localError.message);
        console.error('\n🔧 Solutions:');
        console.error('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
        console.error('2. Or fix Atlas connection:');
        console.error('   - Check if cluster is paused in MongoDB Atlas');
        console.error('   - Whitelist IP: 0.0.0.0/0 in Network Access');
        console.error('   - Verify credentials are correct');
        throw new Error('No MongoDB connection available');
      }
    }

    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error(`\n❌ Fatal Database Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
