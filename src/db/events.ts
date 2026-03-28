import { getDatabase } from './schema';
import type { TrackingEventDetail } from '../api/types';

export interface EventRow {
  id: number;
  parcel_reference: string;
  api_key: string | null;
  created_at: string;
  location: string | null;
  content: string;
  description: string | null;
}

export async function getEventsForParcel(parcelReference: string): Promise<EventRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<EventRow>(
    'SELECT * FROM events WHERE parcel_reference = ? ORDER BY created_at DESC',
    [parcelReference]
  );
}

/**
 * Upserts events from the API into the database.
 * Returns the number of newly inserted events (for notification decisions).
 */
export async function upsertEvents(
  parcelReference: string,
  events: TrackingEventDetail[]
): Promise<number> {
  const db = await getDatabase();
  let insertedCount = 0;

  for (const event of events) {
    const result = await db.runAsync(
      `INSERT OR IGNORE INTO events (
        parcel_reference, api_key, created_at, location, content, description
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        parcelReference,
        event.apiKey || null,
        event.createdAt,
        event.location || null,
        event.message.content,
        event.message.description || null,
      ]
    );
    if (result.changes > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}
