import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

describe('Cloudflare Worker Serverless Endpoints Blackbox Verification', () => {
  const mockEnv = {
    COLLEGE_NAME: "GMC Thiruvallur",
    ENVIRONMENT: "test",
    TELEGRAM_BOT_TOKEN: "mock_tg_token",
    TELEGRAM_ADMIN_CHAT_ID: "12345678",
  };

  const mockCtx = {
    waitUntil: (promise) => promise,
  };

  // Mock outbound Telegram requests
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (typeof url === 'string' && url.includes('api.telegram.org')) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return originalFetch(url, options);
  };

  test('GET /health returns 200 with service health checklist', async () => {
    const req = new Request('https://worker.dev/health', { method: 'GET' });
    const res = await worker.fetch(req, mockEnv, mockCtx);

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.equal(data.college, 'GMC Thiruvallur');
    assert.equal(data.services.telegramBot, true);
  });

  test('POST /api/feedback validates content and returns tracking ID', async () => {
    const payload = {
      category: 'Academics',
      content: 'Lecture Hall 1 AC needs maintenance before final exams.',
      containsPII: false
    };

    const req = new Request('https://worker.dev/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const res = await worker.fetch(req, mockEnv, mockCtx);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.match(data.trackingId, /^GMC-FB-\d{4}$/);
    assert.equal(data.containsPII, false);
  });

  test('POST /api/feedback rejects empty content with 400', async () => {
    const req = new Request('https://worker.dev/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'Academics', content: '' })
    });

    const res = await worker.fetch(req, mockEnv, mockCtx);
    assert.equal(res.status, 400);
  });

  test('POST /api/feedback flags PII if text contains names/rolls', async () => {
    const payload = {
      category: 'Hostel',
      content: 'Contact Dr. Ramesh in Room 204 regarding room keys.',
      containsPII: false
    };

    const req = new Request('https://worker.dev/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const res = await worker.fetch(req, mockEnv, mockCtx);
    const data = await res.json();
    assert.equal(data.containsPII, true);
  });

  test('POST /api/chat/message validates session payload', async () => {
    const payload = {
      sessionId: 'GMC-X7K92',
      sender: 'student',
      text: 'Is the library open tonight?'
    };

    const req = new Request('https://worker.dev/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const res = await worker.fetch(req, mockEnv, mockCtx);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  test('POST /api/telegram/webhook responds to Telegram bot commands', async () => {
    // Test /start
    const update = {
      message: {
        chat: { id: 12345 },
        text: '/start'
      }
    };

    const req = new Request('https://worker.dev/api/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });

    const res = await worker.fetch(req, mockEnv, mockCtx);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
  });

  test('POST /api/ai/analyze generates categorized summary and excludes PII', async () => {
    const payload = {
      feedbacks: [
        {
          category: 'Academics',
          content: 'Microphone issue in lecture hall.',
          containsPII: false,
          aiAnalysis: { sentiment: 'Negative', urgency: 'Medium' }
        },
        {
          category: 'Hostel',
          content: 'My roll number is 44 and room is 202.',
          containsPII: true,
          aiAnalysis: null
        }
      ]
    };

    const req = new Request('https://worker.dev/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const res = await worker.fetch(req, mockEnv, mockCtx);
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.equal(data.totalAnalyzed, 1); // 1 analyzed, PII item excluded!
    assert.equal(data.excludedPIICount, 1);
    assert.equal(data.categoryDistribution['Academics'], 1);
    assert.equal(data.sentimentDistribution['Negative'], 1);
  });

  test('POST /api/ai/analyze rejects unauthorized requests in production', async () => {
    const prodEnv = { ...mockEnv, ENVIRONMENT: 'production', COUNCIL_AUTH_TOKEN: 'gmc-secret-2026' };
    const req = new Request('https://worker.dev/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedbacks: [] })
    });

    const res = await worker.fetch(req, prodEnv, mockCtx);
    assert.equal(res.status, 401);
  });

  test('POST /api/ai/analyze rejects raw master token on operational endpoints with 401', async () => {
    const prodEnv = { ...mockEnv, ENVIRONMENT: 'production', COUNCIL_AUTH_TOKEN: 'gmc-secret-2026' };
    const req = new Request('https://worker.dev/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Council-Token': 'gmc-secret-2026'
      },
      body: JSON.stringify({ feedbacks: [] })
    });

    const res = await worker.fetch(req, prodEnv, mockCtx);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.match(data.error, /Unauthorized/);
  });

  test('OPTIONS request returns standard CORS headers', async () => {
    const req = new Request('https://worker.dev/api/feedback', { method: 'OPTIONS' });
    const res = await worker.fetch(req, mockEnv, mockCtx);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
  });

  test('POST /api/auth/verify succeeds with correct COUNCIL_AUTH_TOKEN and issues signed session token', async () => {
    const customEnv = { ...mockEnv, COUNCIL_AUTH_TOKEN: 'gmc-secret-2026' };
    const req = new Request('https://worker.dev/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'gmc-secret-2026' })
    });

    const res = await worker.fetch(req, customEnv, mockCtx);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.valid, true);
    assert.equal(data.authenticated, true);
    assert.equal(data.role, 'Council Executive');
    assert.ok(typeof data.sessionToken === 'string' && data.sessionToken.startsWith('gmc_sess.'));
    assert.ok(data.expiresAt > Date.now());
    assert.equal(data.token, undefined); // Master token is NEVER echoed back to client!
  });

  test('POST /api/auth/verify validates an issued session token without master passcode', async () => {
    const customEnv = { ...mockEnv, COUNCIL_AUTH_TOKEN: 'gmc-secret-2026' };
    // Step 1: Exchange master token for session token
    const loginReq = new Request('https://worker.dev/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'gmc-secret-2026' })
    });
    const loginRes = await worker.fetch(loginReq, customEnv, mockCtx);
    const { sessionToken } = await loginRes.json();

    // Step 2: Validate the session token on subsequent calls
    const sessionReq = new Request('https://worker.dev/api/auth/verify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sessionToken}` }
    });
    const sessionRes = await worker.fetch(sessionReq, customEnv, mockCtx);
    assert.equal(sessionRes.status, 200);
    const sessionData = await sessionRes.json();
    assert.equal(sessionData.valid, true);
    assert.equal(sessionData.sessionToken, sessionToken);
  });

  test('POST /api/auth/verify rejects forged or tampered session tokens with 401', async () => {
    const customEnv = { ...mockEnv, COUNCIL_AUTH_TOKEN: 'gmc-secret-2026' };
    const forgedReq = new Request('https://worker.dev/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'gmc_sess.eyJzdWIiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OTk5OX0.forgedsignature123' })
    });
    const res = await worker.fetch(forgedReq, customEnv, mockCtx);
    assert.equal(res.status, 401);
  });

  test('POST /api/ai/analyze succeeds with signed session token in production', async () => {
    const prodEnv = { ...mockEnv, ENVIRONMENT: 'production', COUNCIL_AUTH_TOKEN: 'gmc-secret-2026' };
    // Obtain session token
    const loginReq = new Request('https://worker.dev/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'gmc-secret-2026' })
    });
    const loginRes = await worker.fetch(loginReq, prodEnv, mockCtx);
    const { sessionToken } = await loginRes.json();

    // Access AI endpoint using session token
    const req = new Request('https://worker.dev/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({ feedbacks: [] })
    });

    const res = await worker.fetch(req, prodEnv, mockCtx);
    assert.equal(res.status, 200);
  });

  test('POST /api/auth/verify rejects incorrect COUNCIL_AUTH_TOKEN with 401', async () => {
    const customEnv = { ...mockEnv, COUNCIL_AUTH_TOKEN: 'gmc-secret-2026' };
    const req = new Request('https://worker.dev/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'wrong-token' })
    });

    const res = await worker.fetch(req, customEnv, mockCtx);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.valid, false);
    assert.equal(data.authenticated, false);
  });

  test('POST /api/auth/verify supports Authorization Bearer header', async () => {
    const customEnv = { ...mockEnv, COUNCIL_AUTH_TOKEN: 'gmc-secret-2026' };
    const req = new Request('https://worker.dev/api/auth/verify', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer gmc-secret-2026' }
    });

    const res = await worker.fetch(req, customEnv, mockCtx);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.valid, true);
  });

  test('POST /api/auth/verify fails closed with 503 when COUNCIL_AUTH_TOKEN unset in env', async () => {
    const req = new Request('https://worker.dev/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'any-token' })
    });
    const res = await worker.fetch(req, mockEnv, mockCtx);
    assert.equal(res.status, 503);
    const data = await res.json();
    assert.equal(data.valid, false);
    assert.match(data.error, /not configured/);
  });

  test('Worker responses include hardened security headers (HSTS, nosniff, DENY)', async () => {
    const req = new Request('https://worker.dev/health', { method: 'GET' });
    const res = await worker.fetch(req, mockEnv, mockCtx);

    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.match(res.headers.get('strict-transport-security'), /max-age=31536000/);
  });

  test('POST /api/feedback rejects oversized payloads with 413 DoS protection', async () => {
    const req = new Request('https://worker.dev/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '70000' // Exceeds 64KB threshold
      },
      body: JSON.stringify({ category: 'Hostel', content: 'Huge data...' })
    });

    const res = await worker.fetch(req, mockEnv, mockCtx);
    assert.equal(res.status, 413);
    const data = await res.json();
    assert.match(data.error, /exceeds 64KB/i);
  });

  test('Production rate limiter returns 429 when request threshold exceeded', async () => {
    const prodEnv = { ...mockEnv, ENVIRONMENT: 'production' };
    const ipHeaders = { 'Content-Type': 'application/json', 'cf-connecting-ip': '198.51.100.22' };

    // Trigger max rate limit for feedback (20 allowed)
    for (let i = 0; i < 20; i++) {
      const r = new Request('https://worker.dev/api/feedback', {
        method: 'POST',
        headers: ipHeaders,
        body: JSON.stringify({ category: 'Academics', content: 'Normal feedback #' + i })
      });
      const res = await worker.fetch(r, prodEnv, mockCtx);
      assert.equal(res.status, 200);
    }

    // 21st attempt from same IP must be rejected with 429
    const blockedReq = new Request('https://worker.dev/api/feedback', {
      method: 'POST',
      headers: ipHeaders,
      body: JSON.stringify({ category: 'Academics', content: 'Spam submission' })
    });
    const blockedRes = await worker.fetch(blockedReq, prodEnv, mockCtx);
    assert.equal(blockedRes.status, 429);
    assert.ok(blockedRes.headers.get('retry-after'));
  });
});
