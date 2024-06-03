import mongoose from 'mongoose';
import umzug from './umzug.js';

const uri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_INITDB_HOST}/${process.env.MONGO_INITDB_DATABASE}`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

const runMigrations = async () => {
  try {
    await umzug.up();
    console.log('Migrations are finished');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    mongoose.disconnect();
  }
};

runMigrations();
