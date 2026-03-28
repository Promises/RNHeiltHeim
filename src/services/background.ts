import { fetchTracking } from '../api/tracking';
import { getActiveParcelReferences, getParcel, updateParcelFromAPI } from '../db/parcels';
import { upsertEvents } from '../db/events';
import { sendLocalNotification } from './notifications';

const BACKGROUND_FETCH_TASK = 'background-tracking-poll';

try {
  const TaskManager = require('expo-task-manager');
  const BackgroundFetch = require('expo-background-fetch');

  TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
      const refs = await getActiveParcelReferences();
      if (refs.length === 0) {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      let hasNewData = false;

      for (const ref of refs) {
        try {
          const tracking = await fetchTracking(ref);
          if (!tracking) continue;

          const newCount = await upsertEvents(ref, tracking.events);

          if (newCount > 0) {
            hasNewData = true;
            const latestEvent = tracking.events[0];
            const parcel = await getParcel(ref);

            await updateParcelFromAPI(ref, {
              status: tracking.status,
              lastEventContent: latestEvent?.message?.content,
              lastEventAt: latestEvent?.createdAt,
              estimatedDeliveryContent: tracking.estimatedDelivery?.message?.content,
            });

            await sendLocalNotification(
              parcel?.label || parcel?.shop_name || 'Pakke',
              latestEvent?.message?.content || 'Ny oppdatering',
              { parcelReference: ref }
            );
          }
        } catch {
          // Skip individual parcel errors, continue with others
        }
      }

      return hasNewData
        ? BackgroundFetch.BackgroundFetchResult.NewData
        : BackgroundFetch.BackgroundFetchResult.NoData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
} catch {
  // expo-task-manager not available (e.g. Expo Go)
}

export async function registerBackgroundFetch(): Promise<void> {
  try {
    const BackgroundFetch = require('expo-background-fetch');
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
      console.warn('Background fetch is denied');
      return;
    }

    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch {
    // Background fetch not available (e.g. Expo Go)
  }
}
