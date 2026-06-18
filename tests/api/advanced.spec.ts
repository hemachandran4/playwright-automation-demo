import { test, expect } from '@playwright/test';

test.describe('API Testing - Advanced Scenarios', () => {
  const BASE_URL = 'https://api.example.com';

  test('Chained API calls - Create and verify', async ({ request }) => {
    // Create a resource
    const createResponse = await request.post(`${BASE_URL}/users`, {
      data: {
        name: 'Test User',
        email: 'test@example.com',
      },
    });
    
    expect(createResponse.status()).toBe(201);
    const createdUser = await createResponse.json();
    const userId = createdUser.id;

    // Verify the resource was created
    const getResponse = await request.get(`${BASE_URL}/users/${userId}`);
    expect(getResponse.status()).toBe(200);
    
    const userData = await getResponse.json();
    expect(userData.name).toBe('Test User');
  });

  test('API pagination handling', async ({ request }) => {
    let allItems = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await request.get(`${BASE_URL}/items?page=${page}&limit=10`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      allItems = [...allItems, ...data.items];
      
      hasMore = data.hasNextPage;
      page++;
    }

    expect(allItems.length).toBeGreaterThan(0);
  });

  test('Concurrent API requests', async ({ request }) => {
    const requests = Array.from({ length: 5 }, (_, i) => 
      request.get(`${BASE_URL}/users/${i + 1}`)
    );

    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
  });

  test('API response validation with schema', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users/1`);
    expect(response.status()).toBe(200);
    
    const user = await response.json();
    
    // Validate structure
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(typeof user.id).toBe('number');
    expect(typeof user.name).toBe('string');
  });

  test('Multipart form data upload', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/upload`, {
      multipart: {
        file: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('Test file content'),
        },
        description: 'Test upload',
      },
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result).toHaveProperty('fileId');
  });
});