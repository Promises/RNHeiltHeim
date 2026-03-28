import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getAllParcels, updateParcelFromAPI, archiveParcel, type ParcelRow } from '../db/parcels';
import { upsertEvents } from '../db/events';
import { fetchTracking } from '../api/tracking';

export function useParcels(archived: boolean) {
  const [parcels, setParcels] = useState<ParcelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFromDB = useCallback(async () => {
    const rows = await getAllParcels(archived);
    setParcels(rows);
    setLoading(false);
  }, [archived]);

  useFocusEffect(
    useCallback(() => {
      loadFromDB();
    }, [loadFromDB])
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const rows = await getAllParcels(archived);
      if (!archived) {
        await Promise.all(
          rows.map(async (parcel) => {
            try {
              const tracking = await fetchTracking(parcel.parcel_reference);
              if (!tracking) return;
              const latestEvent = tracking.events[0];
              await upsertEvents(parcel.parcel_reference, tracking.events);
              await updateParcelFromAPI(parcel.parcel_reference, {
                status: tracking.status,
                lastEventContent: latestEvent?.message?.content,
                lastEventAt: latestEvent?.createdAt,
                estimatedDeliveryContent: tracking.estimatedDelivery?.message?.content,
              });
              if (tracking.status === 'DELIVERED') {
                await archiveParcel(parcel.parcel_reference);
              }
            } catch {
              // Skip failed refreshes
            }
          })
        );
      }
      await loadFromDB();
    } finally {
      setRefreshing(false);
    }
  }, [archived, loadFromDB]);

  return { parcels, loading, refreshing, refresh, reload: loadFromDB };
}
