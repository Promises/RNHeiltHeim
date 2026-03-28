import { useState, useEffect, useCallback } from 'react';
import { getParcel, updateParcelFromAPI, type ParcelRow } from '../db/parcels';
import { getEventsForParcel, upsertEvents, type EventRow } from '../db/events';
import { fetchTracking } from '../api/tracking';

export function useTrackingDetails(parcelReference: string) {
  const [parcel, setParcel] = useState<ParcelRow | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFromDB = useCallback(async () => {
    const [p, e] = await Promise.all([
      getParcel(parcelReference),
      getEventsForParcel(parcelReference),
    ]);
    setParcel(p);
    setEvents(e);
    setLoading(false);
  }, [parcelReference]);

  const fetchFromAPI = useCallback(async () => {
    try {
      const tracking = await fetchTracking(parcelReference);
      if (!tracking) return;

      const latestEvent = tracking.events[0];
      await upsertEvents(parcelReference, tracking.events);
      await updateParcelFromAPI(parcelReference, {
        status: tracking.status,
        lastEventContent: latestEvent?.message?.content,
        lastEventAt: latestEvent?.createdAt,
        estimatedDeliveryContent: tracking.estimatedDelivery?.message?.content,
      });
      await loadFromDB();
    } catch {
      // Silently fail API fetch, local data is still shown
    }
  }, [parcelReference, loadFromDB]);

  useEffect(() => {
    loadFromDB().then(fetchFromAPI);
  }, [loadFromDB, fetchFromAPI]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFromAPI();
    setRefreshing(false);
  }, [fetchFromAPI]);

  return { parcel, events, loading, refreshing, refresh, reload: loadFromDB };
}
