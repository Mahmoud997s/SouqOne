import request from 'supertest';
import { createTestApp, closeTestApp, getApp, registerUser } from './setup';

beforeAll(async () => { await createTestApp(); });
afterAll(async () => { await closeTestApp(); });

describe('Admin Jobs API (e2e)', () => {
  it('should reject non-admin users from GET /admin/jobs', async () => {
    const user = await registerUser();

    await request(getApp().getHttpServer())
      .get('/api/admin/jobs')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);
  });

  it('should reject non-admin users from GET /admin/jobs/stats', async () => {
    const user = await registerUser();

    await request(getApp().getHttpServer())
      .get('/api/admin/jobs/stats')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);
  });

  it('should reject non-admin from PATCH /admin/jobs/:id', async () => {
    const user = await registerUser();

    await request(getApp().getHttpServer())
      .patch('/api/admin/jobs/some-id')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ status: 'CLOSED' })
      .expect(403);
  });

  it('should reject non-admin from DELETE /admin/jobs/:id', async () => {
    const user = await registerUser();

    await request(getApp().getHttpServer())
      .delete('/api/admin/jobs/some-id')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);
  });

  it('should reject non-admin from GET /admin/jobs/drivers', async () => {
    const user = await registerUser();

    await request(getApp().getHttpServer())
      .get('/api/admin/jobs/drivers')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);
  });

  it('should reject non-admin from GET /admin/jobs/verifications', async () => {
    const user = await registerUser();

    await request(getApp().getHttpServer())
      .get('/api/admin/jobs/verifications')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);
  });

  it('should require auth for admin endpoints', async () => {
    await request(getApp().getHttpServer())
      .get('/api/admin/jobs')
      .expect(401);

    await request(getApp().getHttpServer())
      .get('/api/admin/jobs/stats')
      .expect(401);
  });
});
