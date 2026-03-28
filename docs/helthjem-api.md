# Helthjem Tracking API Documentation

## Overview

Helthjem (helthjem.no) is a Norwegian parcel delivery service. Their tracking system is built on a **GraphQL API** served at `https://services.helthjem.no/graphql`. The frontend at `helthjem.no/sporing` is a Next.js app using Apollo Client.

**No authentication is required** for public tracking lookups.

## Endpoint

```
POST https://services.helthjem.no/graphql
```

### Required Headers

```
Content-Type: application/json
Accept: */*
```

---

## Queries

### 1. GetTracking (Primary)

The main query used to retrieve full tracking information for a parcel. This is the only query needed to get all relevant tracking data.

#### Query

```graphql
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
}
```

#### Variables

```json
{
  "parcelReference": "370724763379145853"
}
```

#### Example Request

```bash
curl -s -X POST https://services.helthjem.no/graphql \
  -H 'Content-Type: application/json' \
  -H 'Accept: */*' \
  -d '{
    "operationName": "GetTracking",
    "variables": {
      "parcelReference": "370724763379145853"
    },
    "query": "query GetTracking($parcelReference: String!) { getParcelTrackingDetails(parcelReference: $parcelReference) { parcelReference availableActions deliveryPoint { postalArea postalCode type } estimatedDelivery { message { content description } reason } events { apiKey createdAt freightProductId location message { content description } } noticeData { message title } sender { postalArea postalCode } servicePoint { address name phoneNumber postalArea postalCode servicePointId coordinates { easting northing } openingHours { day from to } } shipmentNumber trackingNumber shop { id logoUrl name } shopId status } }"
  }'
```

#### Example Response

```json
{
  "data": {
    "getParcelTrackingDetails": {
      "parcelReference": "370724763379145853",
      "availableActions": [],
      "deliveryPoint": {
        "postalArea": "Bryne",
        "postalCode": "4344",
        "type": "MAILBOX"
      },
      "estimatedDelivery": {
        "message": {
          "content": null,
          "description": null
        },
        "reason": "DELIVERED"
      },
      "events": [
        {
          "apiKey": "013",
          "createdAt": "2026-03-24T04:11:41+01:00",
          "freightProductId": 1,
          "location": null,
          "message": {
            "content": "Pakken er levert i postkassen din!",
            "description": null
          }
        },
        {
          "apiKey": "113",
          "createdAt": "2026-03-23T10:54:02+01:00",
          "freightProductId": 1,
          "location": null,
          "message": {
            "content": "Planlagt levering natt til 24. mars!",
            "description": "Tips! Merk postkassen og døren din tydelig med fullt navn, så blir det enkelt for budet å finne deg. Vi leverer om natten, og vil ikke ringe deg når vi leverer. Du får en SMS i morgen tidlig om at pakken er levert."
          }
        },
        {
          "apiKey": "003",
          "createdAt": "2026-03-23T10:49:58+01:00",
          "freightProductId": 1,
          "location": "SANDNES",
          "message": {
            "content": "Pakken er under transport.",
            "description": null
          }
        },
        {
          "apiKey": "002",
          "createdAt": "2026-03-20T20:41:13+01:00",
          "freightProductId": 1,
          "location": "Vestby",
          "message": {
            "content": "Vi har mottatt pakken din, og gjør den klar for veien videre.",
            "description": null
          }
        },
        {
          "apiKey": "003",
          "createdAt": "2026-03-20T20:40:47+01:00",
          "freightProductId": 1,
          "location": "VestbySorter",
          "message": {
            "content": "Pakken er under transport.",
            "description": null
          }
        },
        {
          "apiKey": "001",
          "createdAt": "2026-03-10T19:58:38+01:00",
          "freightProductId": 1,
          "location": null,
          "message": {
            "content": "Nettbutikken har meldt at en pakke er på vei!",
            "description": "Sporingen oppdateres så snart pakken er på vår terminal."
          }
        }
      ],
      "noticeData": null,
      "sender": {
        "postalArea": "Vestby",
        "postalCode": "1540"
      },
      "servicePoint": {
        "address": null,
        "name": null,
        "phoneNumber": null,
        "postalArea": null,
        "postalCode": null,
        "servicePointId": null,
        "coordinates": {
          "easting": null,
          "northing": null
        },
        "openingHours": []
      },
      "shipmentNumber": "70724763379145845",
      "trackingNumber": "370724763379145853",
      "shop": {
        "id": 1954,
        "logoUrl": null,
        "name": "GPN"
      },
      "shopId": 1954,
      "status": "DELIVERED"
    }
  }
}
```

### 2. GetParcelEvents (Lightweight)

A lighter query that returns only events and notice data. Useful for polling/refreshing.

```graphql
query GetParcelEvents($parcelReference: String!) {
  getParcelTrackingDetails(parcelReference: $parcelReference) {
    parcelReference
    events {
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
}
```

### 3. GetTrackingDetails (Supplementary)

Returns delivery details, sender info, service point, and shop — without events.

```graphql
query GetTrackingDetails($parcelReference: String!) {
  getParcelTrackingDetails(parcelReference: $parcelReference) {
    parcelReference
    deliveryPoint {
      postalArea
      postalCode
      type
    }
    events {
      apiKey
      freightProductId
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
    shop {
      name
    }
  }
}
```

### 4. GetLoggedUser (Authenticated)

Requires a session token. Returns user info and flexible delivery options.

```graphql
query GetLoggedUser($bookingId: String!) {
  getLoggedUser {
    id
    email
    phoneNumber
    firstName
    lastName
    phoneNumberVerified
  }
  getFlexibleDeliveryData(bookingId: $bookingId) {
    userActions
    isOwner
  }
}
```

> Note: `bookingId` is the `shipmentNumber` from the tracking response.

---

## Response Field Reference

### ParcelTrackingDetails

| Field | Type | Description |
|---|---|---|
| `parcelReference` | String | The tracking number |
| `availableActions` | [String] | Available actions for the parcel (e.g., flexible delivery) |
| `status` | String | Current parcel status (see Status Values below) |
| `shipmentNumber` | String | Internal shipment reference number |
| `trackingNumber` | String | Same as parcelReference |
| `shopId` | Int | Numeric shop identifier |

### Status Values

| Status | Description |
|---|---|
| `REGISTERED` | Package registered by the sender/shop |
| `IN_TRANSIT` | Package is being transported |
| `OUT_FOR_DELIVERY` | Package is out for delivery |
| `DELIVERED` | Package has been delivered |

### DeliveryPoint

| Field | Type | Description |
|---|---|---|
| `postalArea` | String | Recipient city/area name |
| `postalCode` | String | Recipient postal code |
| `type` | String | Delivery type: `MAILBOX`, `DOOR`, `SERVICE_POINT`, `UNKNOWN` |

### EstimatedDelivery

| Field | Type | Description |
|---|---|---|
| `message.content` | String? | Human-readable ETA text (null when delivered) |
| `message.description` | String? | Additional ETA details |
| `reason` | String | Matches current status value |

### TrackingEventDetails

Events are returned **newest first**.

| Field | Type | Description |
|---|---|---|
| `apiKey` | String | Event type code (see Event Codes below) |
| `createdAt` | String | ISO 8601 timestamp with timezone (e.g., `2026-03-24T04:11:41+01:00`) |
| `freightProductId` | Int | Freight product identifier (typically `1`) |
| `location` | String? | Terminal/city name where event occurred (nullable) |
| `message.content` | String | Human-readable event description |
| `message.description` | String? | Additional event details (nullable) |

### Event API Key Codes

| apiKey | Meaning | Example message |
|---|---|---|
| `001` | Registered by shop | "Nettbutikken har meldt at en pakke er på vei!" |
| `002` | Received at terminal | "Vi har mottatt pakken din, og gjør den klar for veien videre." |
| `003` | In transit | "Pakken er under transport." |
| `113` | Planned delivery notification | "Planlagt levering natt til 24. mars!" |
| `013` | Delivered | "Pakken er levert i postkassen din!" |

### Sender (PostalDetails)

| Field | Type | Description |
|---|---|---|
| `postalArea` | String | Sender city/area |
| `postalCode` | String | Sender postal code |

### Shop

| Field | Type | Description |
|---|---|---|
| `id` | Int | Shop identifier |
| `name` | String | Shop display name |
| `logoUrl` | String? | URL to shop logo (nullable) |

### ServicePoint (for pickup point deliveries)

| Field | Type | Description |
|---|---|---|
| `address` | String? | Street address |
| `name` | String? | Service point name |
| `phoneNumber` | String? | Contact phone number |
| `postalArea` | String? | City/area |
| `postalCode` | String? | Postal code |
| `servicePointId` | String? | Unique service point ID |
| `coordinates.easting` | Float? | Longitude/easting coordinate |
| `coordinates.northing` | Float? | Latitude/northing coordinate |
| `openingHours[].day` | String | Day of week |
| `openingHours[].from` | String | Opening time |
| `openingHours[].to` | String | Closing time |

### NoticeData

| Field | Type | Description |
|---|---|---|
| `title` | String? | Notice title |
| `message` | String? | Notice message (e.g., delivery issues) |

---

## Frontend Architecture

- **Framework:** Next.js (App Router with React Server Components)
- **GraphQL Client:** Apollo Client
- **Domain:** helthjem.no (part of Vend group)
- **Consent:** Sourcepoint CMP (`cmpv2.helthjem.no`)
- **Analytics:** Google Analytics 4 (G-1VPV5S0YT6)
- **CMS:** Sanity (for content)

### Flow

1. User enters tracking number on `/sporing`
2. Form submits as a Next.js server action (`POST /sporing`)
3. Server redirects to `/sporing/{trackingNumber}?status={status}`
4. Client fires `GetTracking` query to `services.helthjem.no/graphql`
5. Supplementary `GetParcelEvents` and `GetTrackingDetails` queries follow
6. If user is logged in, `GetLoggedUser` fires to check flexible delivery options

---

## Rate Limiting / Notes

- No observed rate limiting during testing
- No API key required
- No CORS restrictions observed (works from any origin)
- The API returns Norwegian-language strings for event messages
- Timestamps include timezone offset (typically `+01:00` or `+02:00` for CET/CEST)
