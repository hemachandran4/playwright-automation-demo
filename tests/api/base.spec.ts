import { test, expect } from '@playwright/test';

test.describe('API Testing - Base Examples', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    // Create API context for reuse across tests
    apiContext = await playwright.request.newContext({
      baseURL: 'https://api.example.com',
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('GET request - Fetch user data', async ({ request }) => {
    const response = await request.get('/users/1');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
  });

  test('POST request - Create resource', async ({ request }) => {
    const response = await request.post('/users', {
      data: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    });
    
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.name).toBe('John Doe');
  });

  test('PUT request - Update resource', async ({ request }) => {
    const response = await request.put('/users/1', {
      data: {
        name: 'Jane Doe',
      },
    });
    
    expect(response.status()).toBe(200);
  });

  test('DELETE request - Remove resource', async ({ request }) => {
    const response = await request.delete('/users/1');
    expect(response.status()).toBe(204);
  });

  test('Request with headers and authentication', async ({ request }) => {
    const response = await request.get('/protected/data', {
      headers: {
        'Authorization': 'Bearer token_here',
        'Content-Type': 'application/json',
      },
    });
    
    expect(response.status()).toBe(200);
  });

  test('Handle error responses', async ({ request }) => {
    const response = await request.get('/users/invalid');
    expect(response.status()).toBe(404);
    
    const error = await response.json();
    expect(error).toHaveProperty('error');
  });
});