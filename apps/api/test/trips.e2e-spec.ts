import request from 'supertest';
import { createTestApp, closeTestApp, getApp, registerUser } from './setup';

beforeAll(async () => { await createTestApp(); });
afterAll(async () => { await closeTestApp(); });

const validTrip = {
  title: 'Daily Bus Muscat to Sohar',
  description: 'Comfortable daily bus service between Muscat and Sohar with AC',
  tripType: 'BUS_SUBSCRIPTION',
  routeFrom: 'Muscat',
  routeTo: 'Sohar',
  routeStops: ['Barka', 'Rustaq'],
  scheduleType: 'SCHEDULE_DAILY',
  departureTimes: ['06:00', '14:00'],
  operatingDays: ['SAT', 'SUN', 'MON', 'TUE', 'WED'],
  pricePerTrip: 3,
  priceMonthly: 50,
  providerName: 'Oman Bus Co',
  governorate: 'Muscat',
  contactPhone: '+96899334455',
};

describe('Trips API (e2e)', () => {
  describe('POST /api/trips', () => {
    it('should create a trip', async () => {
      const { accessToken } = await registerUser();
      const res = await request(getApp().getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTrip)
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.tripType).toBe('BUS_SUBSCRIPTION');
      expect(res.body.routeFrom).toBe('Muscat');
    });

    it('should reject without auth', async () => {
      await request(getApp().getHttpServer())
        .post('/api/trips')
        .send(validTrip)
        .expect(401);
    });

    it('should reject invalid tripType', async () => {
      const { accessToken } = await registerUser();
      await request(getApp().getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...validTrip, tripType: 'INVALID' })
        .expect(400);
    });

    it('should reject missing routeFrom', async () => {
      const { accessToken } = await registerUser();
      const { routeFrom, ...noFrom } = validTrip;
      await request(getApp().getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(noFrom)
        .expect(400);
    });
  });

  describe('GET /api/trips', () => {
    it('should list trips', async () => {
      const res = await request(getApp().getHttpServer())
        .get('/api/trips')
        .expect(200);

      expect(res.body.items).toBeInstanceOf(Array);
      expect(res.body.meta).toBeDefined();
    });

    it('should filter by tripType', async () => {
      const { accessToken } = await registerUser();
      await request(getApp().getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTrip);

      const res = await request(getApp().getHttpServer())
        .get('/api/trips?tripType=BUS_SUBSCRIPTION')
        .expect(200);

      res.body.items.forEach((t: any) => expect(t.tripType).toBe('BUS_SUBSCRIPTION'));
    });

    it('should support search', async () => {
      const res = await request(getApp().getHttpServer())
        .get('/api/trips?search=Sohar')
        .expect(200);

      expect(res.body.items).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/trips/:id', () => {
    it('should return trip by id', async () => {
      const { accessToken } = await registerUser();
      const created = await request(getApp().getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTrip);

      const res = await request(getApp().getHttpServer())
        .get(`/api/trips/${created.body.id}`)
        .expect(200);

      expect(res.body.id).toBe(created.body.id);
      expect(res.body.routeStops).toEqual(expect.arrayContaining(['Barka', 'Rustaq']));
    });

    it('should 404 for non-existent trip', async () => {
      await request(getApp().getHttpServer())
        .get('/api/trips/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should include user info', async () => {
      const { accessToken } = await registerUser();
      const created = await request(getApp().getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTrip);

      const res = await request(getApp().getHttpServer())
        .get(`/api/trips/${created.body.id}`)
        .expect(200);

      expect(res.body.user).toBeDefined();
    });
  });

  describe('DELETE /api/trips/:id', () => {
    it('should delete own trip', async () => {
      const { accessToken } = await registerUser();
      const created = await request(getApp().getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTrip);

      await request(getApp().getHttpServer())
        .delete(`/api/trips/${created.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should reject delete by other user', async () => {
      const user1 = await registerUser();
      const user2 = await registerUser();
      const created = await request(getApp().getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send(validTrip);

      await request(getApp().getHttpServer())
        .delete(`/api/trips/${created.body.id}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .expect(403);
    });

    it('should reject without auth', async () => {
      await request(getApp().getHttpServer())
        .delete('/api/trips/some-id')
        .expect(401);
    });
  });
});
