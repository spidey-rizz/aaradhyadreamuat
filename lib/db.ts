import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://divyanshukanojiya86:edith123speed@cluster0.4hi5x60.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = process.env.MONGODB_DB_NAME || "TestDb2";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // Ensure unique index on payouts collection: (user_id, month, year)
  try {
    await db.collection("payouts").createIndex(
      { user_id: 1, month: 1, year: 1 },
      { unique: true, name: "unique_user_month_year_payout" }
    );
  } catch (err) {
    console.error("Failed to create unique index on payouts:", err);
  }

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
