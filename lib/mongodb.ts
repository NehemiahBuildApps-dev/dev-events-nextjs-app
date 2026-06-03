import mongoose from "mongoose";

// Define the connection cache type
type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

declare global {
    var mongooseCache: MongooseCache | undefined;
}

// Reuse the same cached connection across hot reloads in development.
const cached: MongooseCache = global.mongooseCache ?? {
    conn: null,
    promise: null
};

global.mongooseCache = cached;

export default async function connectToDatabase(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    const mongoUri = process.env.MONGODB_URI;
// Validating mongoDB URI exist
    if (!mongoUri) {
        throw new Error("Missing MONGODB_URI environment variable.");
    }

    if (!cached.promise) {
        // Create one in-flight connection promise so concurrent calls share it.
        cached.promise = mongoose.connect(mongoUri, {
            bufferCommands: false
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Reset failed promise so future calls can retry connecting.
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}
