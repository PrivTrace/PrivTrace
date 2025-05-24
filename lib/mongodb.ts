import { MongoClient, type Db } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

if (!process.env.MONGODB_DB) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_DB"');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
    const client = await clientPromise;
    return client.db(dbName);
}

export { clientPromise };
