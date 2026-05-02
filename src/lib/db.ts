import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "aortrack";

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

function requireUri(): string {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local (see .env.example).",
    );
  }
  return uri;
}

export async function getDb(): Promise<Db> {
  const connectionString = requireUri();
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(connectionString);
    globalForMongo._mongoClientPromise = client.connect();
  }
  const client = await globalForMongo._mongoClientPromise;
  return client.db(dbName);
}
