import { GET_TRACKING, GET_PARCEL_EVENTS } from './queries';
import type {
  ParcelTrackingDetails,
  TrackingResponse,
  ParcelEventsResponse,
  TrackingEventDetail,
  ParcelStatus,
} from './types';

const ENDPOINT = 'https://services.helthjem.no/graphql';

export async function fetchTracking(
  parcelReference: string
): Promise<ParcelTrackingDetails | null> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: '*/*' },
    body: JSON.stringify({
      operationName: 'GetTracking',
      variables: { parcelReference },
      query: GET_TRACKING,
    }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const json: TrackingResponse = await res.json();
  return json.data.getParcelTrackingDetails;
}

export async function fetchParcelEvents(
  parcelReference: string
): Promise<{
  events: TrackingEventDetail[];
  status: ParcelStatus | null;
} | null> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: '*/*' },
    body: JSON.stringify({
      operationName: 'GetParcelEvents',
      variables: { parcelReference },
      query: GET_PARCEL_EVENTS,
    }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const json: ParcelEventsResponse = await res.json();
  const details = json.data.getParcelTrackingDetails;
  if (!details) return null;

  return {
    events: details.events,
    status: details.status,
  };
}
