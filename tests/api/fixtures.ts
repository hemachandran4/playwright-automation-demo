import { test as base, APIRequestContext } from '@playwright/test';
import { APIClient } from './helpers/apiClient';

type APIFixtures = {
  apiClient: APIClient;
};

export const test = base.extend<APIFixtures>({
  apiClient: async ({ request }, use) => {
    const client = new APIClient(request, 'https://api.example.com');
    // Setup: Add any default headers or authentication
    // client.setAuthToken('your-token');
    
    await use(client);
    
    // Teardown: Clean up if needed
  },
});

export { expect } from '@playwright/test';