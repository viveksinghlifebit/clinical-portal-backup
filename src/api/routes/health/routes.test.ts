import supertest from 'supertest'

import createApp from 'createApp'
import { loadEndpoints } from 'api/validation'

import { routes } from './routes'

describe('health', () => {
  let server: Http.Server

  beforeAll(async () => {
    const app = createApp()
    await loadEndpoints(app, routes)
    server = app.listen()
  })

  afterAll(() => {
    server.close()
  })

  describe('GET /health', () => {
    const request = (): supertest.Test => supertest(server).get('/health')

    test('When request health, then expect to successfully respond 200.', async () => {
      const expectedStatus = 200
      const expectedBody = { status: 'ok' }
      const { status, body } = await request()
      expect(status).toEqual(expectedStatus)
      expect(body).toEqual(expectedBody)
    })
  })

  describe('POST /health', () => {
    const request = (status?: string): supertest.Test => supertest(server).post('/health').send({ status })

    test('When submit health, then expect to successfully repond 200 with the given status.', async () => {
      const expectedStatus = 200
      const expectedBody = { status: 'down' }
      const { status, body } = await request('down')
      expect(status).toEqual(expectedStatus)
      expect(body).toEqual(expectedBody)
    })

    test('When required fields are missing, then expect to respond 400 with validation error.', async () => {
      const expectedStatus = 400
      const expectedPartialMessage = /should have required property 'status'/
      const { status, body } = await request()
      expect(status).toEqual(expectedStatus)
      expect(body.message).toMatch(expectedPartialMessage)
    })

    test('When fields are not valid, then expect to respond 400 with validation error.', async () => {
      const expectedStatus = 400
      const expectedPartialMessage = /should be equal to one of the allowed values/
      const { status, body } = await request('invalid')
      expect(status).toEqual(expectedStatus)
      expect(body.message).toMatch(expectedPartialMessage)
    })
  })
})
