import request from 'supertest';
import { createTestApp, closeTestApp, getApp, registerUser, createRentalListing } from './setup';

beforeAll(async () => { await createTestApp(); });
afterAll(async () => { await closeTestApp(); });

/** Helper: create a booking between an owner (listing) and a renter */
async function setupBooking() {
  const owner = await registerUser();
  const renter = await registerUser();
  const listingId = await createRentalListing(owner.accessToken);

  // Future dates to avoid past-date validation
  const start = new Date();
  start.setDate(start.getDate() + 7);
  const end = new Date();
  end.setDate(end.getDate() + 14);

  return {
    owner,
    renter,
    listingId,
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

describe('Bookings API (e2e)', () => {
  // ─── Create Booking ───
  describe('POST /api/bookings', () => {
    it('should create a booking on a rental listing', async () => {
      const { renter, listingId, startDate, endDate } = await setupBooking();

      const res = await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ listingId, startDate, endDate })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('PENDING');
      expect(res.body.listingId).toBe(listingId);
    });

    it('should reject without auth', async () => {
      const { listingId, startDate, endDate } = await setupBooking();

      await request(getApp().getHttpServer())
        .post('/api/bookings')
        .send({ listingId, startDate, endDate })
        .expect(401);
    });

    it('should reject missing listingId', async () => {
      const { renter, startDate, endDate } = await setupBooking();

      await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ startDate, endDate })
        .expect(400);
    });

    it('should reject missing dates', async () => {
      const { renter, listingId } = await setupBooking();

      await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ listingId })
        .expect(400);
    });

    it('should create booking with optional fields', async () => {
      const { renter, listingId, startDate, endDate } = await setupBooking();

      const res = await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({
          listingId,
          startDate,
          endDate,
          driverRequested: true,
          pickupLocation: 'Muscat Airport',
          notes: 'Need early pickup',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
    });
  });

  // ─── My Bookings ───
  describe('GET /api/bookings/my', () => {
    it('should return renter bookings', async () => {
      const { renter, listingId, startDate, endDate } = await setupBooking();

      await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ listingId, startDate, endDate });

      const res = await request(getApp().getHttpServer())
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .expect(200);

      expect(res.body.items || res.body).toBeInstanceOf(Array);
    });

    it('should reject without auth', async () => {
      await request(getApp().getHttpServer())
        .get('/api/bookings/my')
        .expect(401);
    });
  });

  // ─── Received Bookings ───
  describe('GET /api/bookings/received', () => {
    it('should return owner received bookings', async () => {
      const { owner, renter, listingId, startDate, endDate } = await setupBooking();

      await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ listingId, startDate, endDate });

      const res = await request(getApp().getHttpServer())
        .get('/api/bookings/received')
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .expect(200);

      expect(res.body.items || res.body).toBeInstanceOf(Array);
    });

    it('should reject without auth', async () => {
      await request(getApp().getHttpServer())
        .get('/api/bookings/received')
        .expect(401);
    });
  });

  // ─── Get One ───
  describe('GET /api/bookings/:id', () => {
    it('should return booking by id for renter', async () => {
      const { renter, listingId, startDate, endDate } = await setupBooking();

      const created = await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ listingId, startDate, endDate });

      const res = await request(getApp().getHttpServer())
        .get(`/api/bookings/${created.body.id}`)
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(created.body.id);
    });

    it('should return booking by id for owner', async () => {
      const { owner, renter, listingId, startDate, endDate } = await setupBooking();

      const created = await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ listingId, startDate, endDate });

      const res = await request(getApp().getHttpServer())
        .get(`/api/bookings/${created.body.id}`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(created.body.id);
    });

    it('should reject unauthorized user', async () => {
      const { renter, listingId, startDate, endDate } = await setupBooking();
      const stranger = await registerUser();

      const created = await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ listingId, startDate, endDate });

      await request(getApp().getHttpServer())
        .get(`/api/bookings/${created.body.id}`)
        .set('Authorization', `Bearer ${stranger.accessToken}`)
        .expect(403);
    });

    it('should reject without auth', async () => {
      await request(getApp().getHttpServer())
        .get('/api/bookings/some-id')
        .expect(401);
    });
  });

  // ─── Update Status ───
  describe('PATCH /api/bookings/:id/status', () => {
    it('should confirm a pending booking (owner)', async () => {
      const { owner, renter, listingId, startDate, endDate } = await setupBooking();

      const created = await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ listingId, startDate, endDate });

      const res = await request(getApp().getHttpServer())
        .patch(`/api/bookings/${created.body.id}/status`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ status: 'CONFIRMED' })
        .expect(200);

      expect(res.body.status).toBe('CONFIRMED');
    });

    it('should reject a pending booking (owner)', async () => {
      const { owner, renter, listingId, startDate, endDate } = await setupBooking();

      const created = await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ listingId, startDate, endDate });

      const res = await request(getApp().getHttpServer())
        .patch(`/api/bookings/${created.body.id}/status`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ status: 'REJECTED' })
        .expect(200);

      expect(res.body.status).toBe('REJECTED');
    });

    it('should cancel a booking (renter)', async () => {
      const { renter, listingId, startDate, endDate } = await setupBooking();

      const created = await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ listingId, startDate, endDate });

      const res = await request(getApp().getHttpServer())
        .patch(`/api/bookings/${created.body.id}/status`)
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ status: 'CANCELLED' })
        .expect(200);

      expect(res.body.status).toBe('CANCELLED');
    });

    it('should reject invalid status value', async () => {
      const { owner, renter, listingId, startDate, endDate } = await setupBooking();

      const created = await request(getApp().getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renter.accessToken}`)
        .send({ listingId, startDate, endDate });

      await request(getApp().getHttpServer())
        .patch(`/api/bookings/${created.body.id}/status`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('should reject without auth', async () => {
      await request(getApp().getHttpServer())
        .patch('/api/bookings/some-id/status')
        .send({ status: 'CONFIRMED' })
        .expect(401);
    });
  });

  // ─── Availability ───
  describe('GET /api/bookings/availability/:listingId', () => {
    it('should return availability for a listing', async () => {
      const { listingId } = await setupBooking();

      const res = await request(getApp().getHttpServer())
        .get(`/api/bookings/availability/${listingId}`)
        .expect(200);

      // Should return some data about booked/available dates
      expect(res.body).toBeDefined();
    });
  });

  // ─── Price Calculation ───
  describe('GET /api/bookings/calculate-price', () => {
    it('should calculate price for a rental period', async () => {
      const { listingId, startDate, endDate } = await setupBooking();

      const res = await request(getApp().getHttpServer())
        .get(`/api/bookings/calculate-price?listingId=${listingId}&startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(res.body).toBeDefined();
      // Should return price-related info
      expect(res.body.totalPrice || res.body.total || res.body.price).toBeDefined();
    });
  });
});
