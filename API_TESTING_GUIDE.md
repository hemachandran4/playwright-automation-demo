# Playwright API Testing Guide

## Overview

This guide provides best practices and baseline setup for API testing using Playwright. Playwright's APIRequestContext allows you to test APIs directly without a browser, making it ideal for integration and backend testing.

## Table of Contents

1. [Setup](#setup)
2. [Basic API Testing](#basic-api-testing)
3. [Best Practices](#best-practices)
4. [Advanced Scenarios](#advanced-scenarios)
5. [Helper Classes](#helper-classes)
6. [Common Patterns](#common-patterns)

---

## Setup

### Installation

```bash
npm install -D @playwright/test
```

### Configuration

Update `playwright.config.ts` with your API base URL:

```typescript
export default defineConfig({
  use: {
    baseURL: 'https://api.example.com',
  },
});
```

---

## Basic API Testing

### GET Request

```typescript
test('GET request', async ({ request }) => {
  const response = await request.get('/users/1');
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.id).toBe(1);
});
```

### POST Request

```typescript
test('POST request', async ({ request }) => {
  const response = await request.post('/users', {
    data: {
      name: 'John',
      email: 'john@example.com',
    },
  });
  expect(response.status()).toBe(201);
});
```

### PUT/PATCH Request

```typescript
test('PUT request', async ({ request }) => {
  const response = await request.put('/users/1', {
    data: { name: 'Jane' },
  });
  expect(response.status()).toBe(200);
});
```

### DELETE Request

```typescript
test('DELETE request', async ({ request }) => {
  const response = await request.delete('/users/1');
  expect(response.status()).toBe(204);
});
```

---

## Best Practices

### 1. **Use APIRequestContext for Reusability**

```typescript
test.beforeAll(async ({ playwright }) => {
  const context = await playwright.request.newContext({
    baseURL: 'https://api.example.com',
  });
});
```

### 2. **Set Default Headers**

```typescript
const response = await request.get('/data', {
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json',
  },
});
```

### 3. **Environment-Based Configuration**

```typescript
const baseURL = process.env.API_BASE_URL || 'https://api.example.com';
```

### 4. **Response Validation**

```typescript
const response = await request.get('/users/1');
expect(response.status()).toBe(200);
expect(response.headers()['content-type']).toContain('application/json');

const data = await response.json();
expect(data).toEqual({
  id: expect.any(Number),
  name: expect.any(String),
  email: expect.any(String),
});
```

### 5. **Error Handling**

```typescript
test('Handle API errors gracefully', async ({ request }) => {
  const response = await request.get('/users/invalid');
  expect(response.status()).toBe(404);
  
  const error = await response.json();
  expect(error.message).toBeDefined();
});
```

### 6. **Test Data Management**

```typescript
test.describe('API Tests', () => {
  let testUserId: number;

  test.beforeEach(async ({ request }) => {
    // Create test data
    const response = await request.post('/users', {
      data: { name: 'Test User' },
    });
    testUserId = (await response.json()).id;
  });

  test.afterEach(async ({ request }) => {
    // Clean up test data
    await request.delete(`/users/${testUserId}`);
  });
});
```

---

## Advanced Scenarios

### 1. **Chained API Calls**

```typescript
test('Create and verify user', async ({ request }) => {
  // Create
  const createRes = await request.post('/users', {
    data: { name: 'Test' },
  });
  const userId = (await createRes.json()).id;

  // Verify
  const getRes = await request.get(`/users/${userId}`);
  expect(getRes.status()).toBe(200);
});
```

### 2. **Concurrent Requests**

```typescript
test('Concurrent API calls', async ({ request }) => {
  const requests = Array.from({ length: 5 }, (_, i) =>
    request.get(`/users/${i + 1}`)
  );
  const responses = await Promise.all(requests);
  responses.forEach(r => expect(r.status()).toBe(200));
});
```

### 3. **Pagination Handling**

```typescript
test('Fetch paginated data', async ({ request }) => {
  let allItems = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await request.get(`/items?page=${page}`);
    const data = await response.json();
    allItems = [...allItems, ...data.items];
    hasMore = data.hasNextPage;
    page++;
  }

  expect(allItems.length).toBeGreaterThan(0);
});
```

### 4. **Multipart Form Data**

```typescript
test('Upload file via multipart form', async ({ request }) => {
  const response = await request.post('/upload', {
    multipart: {
      file: {
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('content'),
      },
      description: 'Test file',
    },
  });
  expect(response.status()).toBe(200);
});
```

### 5. **Custom Request/Response Logging**

```typescript
test('Log API interactions', async ({ request }) => {
  const response = await request.get('/users/1');
  
  console.log('Status:', response.status());
  console.log('Headers:', response.headers());
  console.log('Body:', await response.json());
});
```

---

## Helper Classes

### APIClient Wrapper

Use the provided `APIClient` helper class for cleaner, more maintainable code:

```typescript
import { APIClient } from './helpers/apiClient';

test('Using APIClient', async ({ request }) => {
  const client = new APIClient(request, 'https://api.example.com');
  client.setAuthToken('your-token');

  const response = await client.get('/users/1');
  await response.expectStatus(200);
  const data = await response.getJSON();
  expect(data.id).toBeDefined();
});
```

### Custom Fixtures

Define reusable fixtures in `fixtures.ts`:

```typescript
export const test = base.extend<APIFixtures>({
  apiClient: async ({ request }, use) => {
    const client = new APIClient(request, 'https://api.example.com');
    client.setAuthToken(process.env.API_TOKEN || '');
    await use(client);
  },
});
```

Use in tests:

```typescript
test('With fixture', async ({ apiClient }) => {
  const response = await apiClient.get('/users/1');
  await response.expectStatus(200);
});
```

---

## Common Patterns

### Authentication

```typescript
// Bearer Token
headers: {
  'Authorization': `Bearer ${token}`,
}

// API Key
headers: {
  'X-API-Key': apiKey,
}

// Basic Auth
headers: {
  'Authorization': `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`,
}
```

### Response Assertions

```typescript
// Status codes
expect(response.status()).toBe(200);

// Headers
expect(response.headers()['content-type']).toContain('application/json');

// Body structure
const data = await response.json();
expect(data).toMatchObject({
  id: expect.any(Number),
  name: expect.any(String),
});
```

### Timeout Configuration

```typescript
const response = await request.get('/slow-endpoint', {
  timeout: 30000, // 30 seconds
});
```

### Retry Logic

```typescript
test.configure({ retries: 3 });
// or per test
test('Flaky API', async ({ request }) => {
  // This test will retry up to 3 times
});
```

---

## Running Tests

```bash
# Run all API tests
npm run test:api

# Run with headed browser (for debugging)
npm run test:headed

# Debug mode
npm run test:debug

# View HTML report
npm run test:report
```

---

## Troubleshooting

### Connection Issues
- Verify `baseURL` is correct
- Check network connectivity and firewall rules
- Use `timeout` parameter for slow endpoints

### Authentication Failures
- Verify token/API key format
- Check token expiration
- Ensure proper header names

### Flaky Tests
- Add appropriate timeouts
- Use `test.retries` for unreliable endpoints
- Implement proper test data cleanup

---

## Resources

- [Playwright API Testing Documentation](https://playwright.dev/docs/api-testing)
- [APIRequestContext](https://playwright.dev/docs/api-class-apirequestcontext)
- [Best Practices](https://playwright.dev/docs/best-practices)
