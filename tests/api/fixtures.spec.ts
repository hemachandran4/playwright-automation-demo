import { test, expect } from './fixtures';

test.describe('API Testing - Using Fixtures', () => {
  test('Use apiClient fixture for simplified API testing', async ({ apiClient }) => {
    const response = await apiClient.get('/users/1');
    await response.expectStatus(200);
    
    const user = await response.getJSON();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
  });

  test('Chain multiple API calls with fixture', async ({ apiClient }) => {
    // Create user
    const createResponse = await apiClient.post('/users', {
      name: 'Test User',
      email: 'test@example.com',
    });
    await createResponse.expectStatus(201);
    
    const user = await createResponse.getJSON();
    const userId = user.id;

    // Fetch user
    const getResponse = await apiClient.get(`/users/${userId}`);
    await getResponse.expectStatus(200);
  });
});