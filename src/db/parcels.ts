import { getDatabase } from './schema';
import type { ParcelTrackingDetails } from '../api/types';

export interface ParcelRow {
  id: number;
  parcel_reference: string;
  label: string | null;
  status: string | null;
  shop_name: string | null;
  shop_logo_url: string | null;
  sender_postal_area: string | null;
  sender_postal_code: string | null;
  delivery_postal_area: string | null;
  delivery_postal_code: string | null;
  delivery_type: string | null;
  estimated_delivery_content: string | null;
  shipment_number: string | null;
  last_event_content: string | null;
  last_event_at: string | null;
  is_archived: number;
  created_at: string;
  updated_at: string;
}

export async function getAllParcels(archived: boolean): Promise<ParcelRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<ParcelRow>(
    'SELECT * FROM parcels WHERE is_archived = ? ORDER BY updated_at DESC',
    [archived ? 1 : 0]
  );
}

export async function getParcel(parcelReference: string): Promise<ParcelRow | null> {
  const db = await getDatabase();
  return db.getFirstAsync<ParcelRow>(
    'SELECT * FROM parcels WHERE parcel_reference = ?',
    [parcelReference]
  );
}

export async function insertParcelFromAPI(
  data: ParcelTrackingDetails,
  label?: string
): Promise<void> {
  const db = await getDatabase();
  const latestEvent = data.events[0];

  await db.runAsync(
    `INSERT OR IGNORE INTO parcels (
      parcel_reference, label, status, shop_name, shop_logo_url,
      sender_postal_area, sender_postal_code,
      delivery_postal_area, delivery_postal_code, delivery_type,
      estimated_delivery_content, shipment_number,
      last_event_content, last_event_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.parcelReference,
      label || null,
      data.status,
      data.shop?.name || null,
      data.shop?.logoUrl || null,
      data.sender?.postalArea || null,
      data.sender?.postalCode || null,
      data.deliveryPoint?.postalArea || null,
      data.deliveryPoint?.postalCode || null,
      data.deliveryPoint?.type || null,
      data.estimatedDelivery?.message?.content || null,
      data.shipmentNumber || null,
      latestEvent?.message?.content || null,
      latestEvent?.createdAt || null,
    ]
  );
}

export async function updateParcelFromAPI(
  parcelReference: string,
  data: {
    status?: string;
    lastEventContent?: string;
    lastEventAt?: string;
    estimatedDeliveryContent?: string | null;
  }
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE parcels SET
      status = COALESCE(?, status),
      last_event_content = COALESCE(?, last_event_content),
      last_event_at = COALESCE(?, last_event_at),
      estimated_delivery_content = COALESCE(?, estimated_delivery_content),
      updated_at = datetime('now')
    WHERE parcel_reference = ?`,
    [
      data.status || null,
      data.lastEventContent || null,
      data.lastEventAt || null,
      data.estimatedDeliveryContent ?? null,
      parcelReference,
    ]
  );
}

export async function archiveParcel(parcelReference: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE parcels SET is_archived = 1, updated_at = datetime(\'now\') WHERE parcel_reference = ?',
    [parcelReference]
  );
}

export async function unarchiveParcel(parcelReference: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE parcels SET is_archived = 0, updated_at = datetime(\'now\') WHERE parcel_reference = ?',
    [parcelReference]
  );
}

export async function deleteParcel(parcelReference: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM parcels WHERE parcel_reference = ?',
    [parcelReference]
  );
}

export async function getActiveParcelReferences(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ parcel_reference: string }>(
    'SELECT parcel_reference FROM parcels WHERE is_archived = 0'
  );
  return rows.map((r) => r.parcel_reference);
}
