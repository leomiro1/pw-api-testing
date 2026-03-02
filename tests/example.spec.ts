import { test, expect } from '@playwright/test';

let authToken: string

test.beforeAll('Get Token', async({request}) => {
  const tokenResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login',{
    data:  {"user": { "email": "pwapiuser@test.com", "password": "Welcome" } }
  })
  const tokenResponseJSON = await tokenResponse.json()
  authToken = 'Token ' + tokenResponseJSON.user.token
})

  
test('Get Test Tags title', async ({ request }) => {
  const tagsResponse = await request.get('https://conduit-api.bondaracademy.com/api/tags')
  const tagsResponseJSON = await tagsResponse.json()

  expect(tagsResponse.status()).toEqual(200)
  expect(tagsResponseJSON.tags[0]).toEqual('Test')
  expect(tagsResponseJSON.tags.length).toBeLessThanOrEqual(10)
  console.log(authToken);
});
