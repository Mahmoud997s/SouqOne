import request from 'supertest';
import { createTestApp, closeTestApp, getApp, registerUser } from './setup';

beforeAll(async () => { await createTestApp(); });
afterAll(async () => { await closeTestApp(); });

const validJob = {
  title: 'Looking for experienced truck driver',
  description: 'We need an experienced truck driver for long-haul routes between cities',
  jobType: 'HIRING',
  employmentType: 'FULL_TIME',
  salary: 800,
  salaryPeriod: 'MONTHLY',
  experienceYears: 3,
  governorate: 'Muscat',
  contactPhone: '+96899556677',
};

describe('Jobs API (e2e)', () => {
  describe('POST /api/jobs', () => {
    it('should create a job', async () => {
      const { accessToken } = await registerUser();
      const res = await request(getApp().getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validJob)
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.jobType).toBe('HIRING');
    });

    it('should reject without auth', async () => {
      await request(getApp().getHttpServer())
        .post('/api/jobs')
        .send(validJob)
        .expect(401);
    });

    it('should reject invalid jobType', async () => {
      const { accessToken } = await registerUser();
      await request(getApp().getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...validJob, jobType: 'INVALID' })
        .expect(400);
    });
  });

  describe('GET /api/jobs', () => {
    it('should list jobs', async () => {
      const res = await request(getApp().getHttpServer())
        .get('/api/jobs')
        .expect(200);

      expect(res.body.items).toBeInstanceOf(Array);
      expect(res.body.meta).toBeDefined();
    });

    it('should filter by jobType', async () => {
      const { accessToken } = await registerUser();
      await request(getApp().getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validJob);

      const res = await request(getApp().getHttpServer())
        .get('/api/jobs?jobType=HIRING')
        .expect(200);

      res.body.items.forEach((j: any) => expect(j.jobType).toBe('HIRING'));
    });

    it('should support search', async () => {
      const res = await request(getApp().getHttpServer())
        .get('/api/jobs?search=truck')
        .expect(200);

      expect(res.body.items).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should return job by id', async () => {
      const { accessToken } = await registerUser();
      const created = await request(getApp().getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validJob);

      const res = await request(getApp().getHttpServer())
        .get(`/api/jobs/${created.body.id}`)
        .expect(200);

      expect(res.body.id).toBe(created.body.id);
    });

    it('should 404 for non-existent job', async () => {
      await request(getApp().getHttpServer())
        .get('/api/jobs/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should include poster info', async () => {
      const { accessToken } = await registerUser();
      const created = await request(getApp().getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validJob);

      const res = await request(getApp().getHttpServer())
        .get(`/api/jobs/${created.body.id}`)
        .expect(200);

      expect(res.body.user || res.body.poster).toBeDefined();
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    it('should delete own job', async () => {
      const { accessToken } = await registerUser();
      const created = await request(getApp().getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validJob);

      await request(getApp().getHttpServer())
        .delete(`/api/jobs/${created.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should reject delete by other user', async () => {
      const user1 = await registerUser();
      const user2 = await registerUser();
      const created = await request(getApp().getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send(validJob);

      await request(getApp().getHttpServer())
        .delete(`/api/jobs/${created.body.id}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .expect(403);
    });

    it('should reject without auth', async () => {
      await request(getApp().getHttpServer())
        .delete('/api/jobs/some-id')
        .expect(401);
    });
  });
});
