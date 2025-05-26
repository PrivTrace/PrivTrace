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
    const db = client.db(dbName);

    // Ensure indexes are created for optimal performance and searching
    try {
        // Create indexes only once - check if they exist first
        const collections = await db.listCollections().toArray();
        const dsrRequestsExists = collections.some(
            (c) => c.name === "dsrRequests",
        );

        if (dsrRequestsExists) {
            const indexes = await db.collection("dsrRequests").indexes();
            const hasEmailHashIndex = indexes.some(
                (idx) => idx.name === "requesterEmailHash_1",
            );

            if (!hasEmailHashIndex) {
                // Create index on hashed email for efficient searches
                await db
                    .collection("dsrRequests")
                    .createIndex({ requesterEmailHash: 1 });
                console.log("Created index on requesterEmailHash");
            }
        }
    } catch (err) {
        console.error("Error setting up database indexes:", err);
    }

    return db;
}

export { clientPromise };
