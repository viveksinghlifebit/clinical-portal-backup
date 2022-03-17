import mongoose from 'mongoose'

import { MongoQuery } from './MongoQuery'
import { MongoQueryPagination } from './MongoQueryPagination'

describe('MongoQueryPagination', () => {
  const Model = mongoose.model('', new mongoose.Schema())
  const mongoQuery = new MongoQuery(Model)

  describe('constructor', () => {
    test('When creating a new MongoQuery instance, then it should match attributes.', () => {
      const mongoQueryPagination = new MongoQueryPagination(mongoQuery)
      expect(mongoQueryPagination._MongoQuery).toEqual(mongoQuery)
      expect(mongoQueryPagination._pageNumber).toEqual(1)
      expect(mongoQueryPagination._pageSize).toEqual(15)
    })

    test('When creating a new MongoQuery instance with pageNumber & pageSize, then it should match attributes.', () => {
      const pageNumber = 2
      const pageSize = 8
      const mongoQueryPagination = new MongoQueryPagination(mongoQuery, pageNumber, pageSize)
      expect(mongoQueryPagination._MongoQuery).toEqual(mongoQuery)
      expect(mongoQueryPagination._pageNumber).toEqual(pageNumber)
      expect(mongoQueryPagination._pageSize).toEqual(pageSize)
    })
  })

  describe('compile', () => {
    const mockModelCount = (count: number): void => {
      jest.spyOn(Model, 'count').mockResolvedValue(count)
    }

    afterEach(jest.restoreAllMocks)

    test('When called and no records are find, then it should return the correct pagination.', async () => {
      const totalCount = 0
      mockModelCount(totalCount)
      const mongoQueryPagination = new MongoQueryPagination(mongoQuery)
      expect(await mongoQueryPagination.compile()).toEqual({
        query: mongoQuery._query,
        sort: mongoQuery._sort,
        skip: 0,
        pagination: {
          pageSize: 0,
          pageNumber: 1,
          totalCount: 0,
          totalPages: 1
        }
      })
      expect(Model.count).toHaveBeenCalledTimes(1)
    })

    test('When called, then it should return the pagination with default pageNumber & pageSize.', async () => {
      const totalCount = 18
      mockModelCount(totalCount)
      const mongoQueryPagination = new MongoQueryPagination(mongoQuery)
      expect(await mongoQueryPagination.compile()).toEqual({
        query: mongoQuery._query,
        sort: mongoQuery._sort,
        skip: 0,
        pagination: {
          pageSize: 15,
          pageNumber: 1,
          totalCount,
          totalPages: 2
        }
      })
      expect(Model.count).toHaveBeenCalledTimes(1)
    })

    test('When called with pageNumber & pageSize, then it should return the correct pagination.', async () => {
      const pageNumber = 2
      const pageSize = 4
      const totalCount = 10
      mockModelCount(totalCount)
      const mongoQueryPagination = new MongoQueryPagination(mongoQuery, pageNumber, pageSize)
      expect(await mongoQueryPagination.compile()).toEqual({
        query: mongoQuery._query,
        sort: mongoQuery._sort,
        skip: 4,
        pagination: {
          pageSize,
          pageNumber,
          totalCount,
          totalPages: 3
        }
      })
      expect(Model.count).toHaveBeenCalledTimes(1)
    })
  })
})
