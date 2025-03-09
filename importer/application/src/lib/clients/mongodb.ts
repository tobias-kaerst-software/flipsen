import { MongoClient } from 'mongodb';

export const mongodb = new MongoClient('mongodb://localhost:27017', {
  auth: { username: 'root', password: 'root' },
});
