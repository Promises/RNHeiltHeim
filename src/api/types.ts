export type ParcelStatus = 'REGISTERED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

export type DeliveryType = 'MAILBOX' | 'DOOR' | 'SERVICE_POINT' | 'UNKNOWN';

export interface TrackingEventDetail {
  apiKey: string;
  createdAt: string;
  freightProductId: number;
  location: string | null;
  message: {
    content: string;
    description: string | null;
  };
}

export interface ParcelTrackingDetails {
  parcelReference: string;
  availableActions: string[];
  status: ParcelStatus;
  shipmentNumber: string;
  trackingNumber: string;
  shopId: number;
  shop: {
    id: number;
    name: string;
    logoUrl: string | null;
  };
  sender: {
    postalArea: string;
    postalCode: string;
  };
  deliveryPoint: {
    postalArea: string;
    postalCode: string;
    type: DeliveryType;
  };
  estimatedDelivery: {
    message: {
      content: string | null;
      description: string | null;
    };
    reason: string;
  };
  events: TrackingEventDetail[];
  noticeData: {
    title: string;
    message: string;
  } | null;
  servicePoint: {
    address: string | null;
    name: string | null;
    phoneNumber: string | null;
    postalArea: string | null;
    postalCode: string | null;
    servicePointId: string | null;
    coordinates: {
      easting: number | null;
      northing: number | null;
    };
    openingHours: Array<{
      day: string;
      from: string;
      to: string;
    }>;
  };
}

export interface TrackingResponse {
  data: {
    getParcelTrackingDetails: ParcelTrackingDetails | null;
  };
}

export interface ParcelEventsResponse {
  data: {
    getParcelTrackingDetails: {
      parcelReference: string;
      status: ParcelStatus;
      events: TrackingEventDetail[];
      noticeData: {
        title: string;
        message: string;
      } | null;
    } | null;
  };
}
