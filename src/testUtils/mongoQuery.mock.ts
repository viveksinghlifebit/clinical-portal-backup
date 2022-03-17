/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoQuery } from '@core/mongoQuery'

jest.mock('@core/mongoQuery', () => ({ MongoQuery: jest.fn() }))

export const getMockedMongoQueryInstance = (): {
  withTeamOrOwner: jest.Mock
  withSearch: jest.Mock
  withSort: jest.Mock
  withPagination: jest.Mock
  compile: jest.Mock
  withFields: jest.Mock
} => {
  const mongoQuery = {
    withTeamOrOwner: jest.fn(function (this: any) {
      return this
    }),
    withSearch: jest.fn(function (this: any) {
      return this
    }),
    withSort: jest.fn(function (this: any) {
      return this
    }),
    withPagination: jest.fn(function (this: any) {
      return this
    }),
    compile: jest.fn(function (this: any) {
      return { query: {}, pagination: {} }
    }),
    withFields: jest.fn(function (this: any) {
      return this
    })
  }
  ;(MongoQuery as jest.Mock).mockImplementation(() => mongoQuery)
  return mongoQuery
}
