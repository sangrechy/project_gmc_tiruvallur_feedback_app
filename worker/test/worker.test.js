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

  test('OPTIONS request returns standard CORS headers', async () => {
    const req = new Request('https://worker.dev/api/feedback', { method: 'OPTIONS' });
    const res = await worker.fetch(req, mockEnv, mockCtx);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
  });
});
