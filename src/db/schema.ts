import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('heiltheim.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await initTables(db);
  return db;
}

async function initTables(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS parcels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parcel_reference TEXT UNIQUE NOT NULL,
      label TEXT,
      status TEXT,
      shop_name TEXT,
      shop_logo_url TEXT,
      sender_postal_area TEXT,
      sender_postal_code TEXT,
      delivery_postal_area TEXT,
      delivery_postal_code TEXT,
      delivery_type TEXT,
      estimated_delivery_content TEXT,
      shipment_number TEXT,
      last_event_content TEXT,
      last_event_at TEXT,
      is_archived INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parcel_reference TEXT NOT NULL,
      api_key TEXT,
      created_at TEXT NOT NULL,
      location TEXT,
      content TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (parcel_reference) REFERENCES parcels(parcel_reference) ON DELETE CASCADE,
      UNIQUE(parcel_reference, api_key, created_at)
    );
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_events_parcel ON events(parcel_reference);
  `);
}
