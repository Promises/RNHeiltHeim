import { fetchTracking, fetchParcelEvents } from '../tracking';

const KNOWN_TRACKING_NUMBER = '370724763379145853';

describe('fetchTracking (real API)', () => {
  it('returns tracking details for a known parcel', async () => {
    const result = await fetchTracking(KNOWN_TRACKING_NUMBER);

    expect(result).not.toBeNull();
    expect(result!.parcelReference).toBe(KNOWN_TRACKING_NUMBER);
    expect(result!.trackingNumber).toBe(KNOWN_TRACKING_NUMBER);
    expect(result!.status).toBeDefined();
    expect(['REGISTERED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED']).toContain(result!.status);
  });

  it('has events array with expected shape', async () => {
    const result = await fetchTracking(KNOWN_TRACKING_NUMBER);

    expect(Array.isArray(result!.events)).toBe(true);
    expect(result!.events.length).toBeGreaterThan(0);

    const event = result!.events[0];
    expect(event.apiKey).toBeDefined();
    expect(event.createdAt).toBeDefined();
    expect(event.message).toBeDefined();
    expect(event.message.content).toBeDefined();
    expect(typeof event.message.content).toBe('string');
  });

  it('has shop info', async () => {
    const result = await fetchTracking(KNOWN_TRACKING_NUMBER);

    expect(result!.shop).toBeDefined();
    expect(result!.shop.name).toBeDefined();
    expect(result!.shopId).toBeDefined();
  });

  it('has delivery point info', async () => {
    const result = await fetchTracking(KNOWN_TRACKING_NUMBER);

    expect(result!.deliveryPoint).toBeDefined();
    expect(result!.deliveryPoint.postalArea).toBeDefined();
    expect(result!.deliveryPoint.postalCode).toBeDefined();
    expect(result!.deliveryPoint.type).toBeDefined();
  });

  it('has sender info', async () => {
    const result = await fetchTracking(KNOWN_TRACKING_NUMBER);

    expect(result!.sender).toBeDefined();
    expect(result!.sender.postalArea).toBeDefined();
    expect(result!.sender.postalCode).toBeDefined();
  });

  it('returns null for invalid tracking number', async () => {
    const result = await fetchTracking('000000000000000000');
    expect(result).toBeNull();
  });
});

describe('fetchParcelEvents (real API)', () => {
  it('returns events and status for a known parcel', async () => {
    const result = await fetchParcelEvents(KNOWN_TRACKING_NUMBER);

    expect(result).not.toBeNull();
    expect(Array.isArray(result!.events)).toBe(true);
    expect(result!.events.length).toBeGreaterThan(0);
    expect(result!.status).toBeDefined();
  });

  it('returns null for invalid tracking number', async () => {
    const result = await fetchParcelEvents('000000000000000000');
    expect(result).toBeNull();
  });
});
