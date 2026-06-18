import { test, expect } from '@playwright/test';
import { APIClient } from './helpers/apiClient';

test.describe('API Testing - Using APIClient Helper', () => {
  const BASE_URL = 'https://api.example.com';

  test('Using APIClient for GET request', async ({ request }) => {
    const client = new APIClient(request, BASE_URL);

    const response = await client.get('/users/1');
    await response.expectStatus(200);
    
    const data = await response.getJSON();
    expect(data.id).toBeDefined();
  });

  test('Using APIClient with authentication', async ({ request }) => {
    const client = new APIClient(request, BASE_URL);
    client.setAuthToken('your-token-here');
    client.setHeader('X-Custom-Header', 'custom-value');

    const response = await client.get('/protected/data');
    await response.expectStatus(200);
  });

  test('Using APIClient for POST request with validation', async ({ request }) => {
    const client = new APIClient(request, BASE_URL);

    const response = await client.post('/users', {
      name: 'New User',
      email: 'newuser@example.com',
    });

    await response.expectStatus(201);
    const data = await response.getJSON();
    expect(data.name).toBe('New User');
  });
});