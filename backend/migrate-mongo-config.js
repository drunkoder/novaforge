import dotenv from 'dotenv';
dotenv.config();

const uri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_INITDB_HOST}/${process.env.MONGO_INITDB_DATABASE}`;

const config = {
  mongodb: {
    url: uri,
    databaseName: process.env.MONGO_INITDB_DATABASE,

    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
};

export default config;
