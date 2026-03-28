export const GET_TRACKING = `
query GetTracking($parcelReference: String!) {
  getParcelTrackingDetails(parcelReference: $parcelReference) {
    parcelReference
    availableActions
    deliveryPoint {
      postalArea
      postalCode
      type
    }
    estimatedDelivery {
      message {
        content
        description
      }
      reason
    }
    events {
      apiKey
      createdAt
      freightProductId
      location
      message {
        content
        description
      }
    }
    noticeData {
      message
      title
    }
    sender {
      postalArea
      postalCode
    }
    servicePoint {
      address
      name
      phoneNumber
      postalArea
      postalCode
      servicePointId
      coordinates {
        easting
        northing
      }
      openingHours {
        day
        from
        to
      }
    }
    shipmentNumber
    trackingNumber
    shop {
      id
      logoUrl
      name
    }
    shopId
    status
  }
}`;

export const GET_PARCEL_EVENTS = `
query GetParcelEvents($parcelReference: String!) {
  getParcelTrackingDetails(parcelReference: $parcelReference) {
    parcelReference
    status
    events {
      apiKey
      createdAt
      location
      message {
        content
        description
      }
    }
    noticeData {
      message
      title
    }
  }
}`;
