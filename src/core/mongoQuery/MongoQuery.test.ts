import mongoose from 'mongoose'

import { TeamBuilder, UserBuilder } from 'testUtils'

import { MongoQueryPagination } from './MongoQueryPagination'
import { MongoQuery } from './MongoQuery'

describe('MongoQuery', () => {
  const Model = mongoose.model('', new mongoose.Schema())

  describe('constructor', () => {
    test('When creating a new MongoQuery instance, then it should match attributes.', () => {
      const mongoQuery = new MongoQuery(Model)
      expect(mongoQuery._Model).toEqual(Model)
      expect(mongoQuery._query).toEqual({})
      expect(mongoQuery._sort).toEqual({ createdAt: -1 })
    })
  })

  describe('withUser', () => {
    test('When called, then it should add user to the query attribute.', () => {
      const user: User = new UserBuilder().withId(new mongoose.Types.ObjectId()).withName('user').build()
      const mongoQuery = new MongoQuery(Model).withUser(user)
      expect(mongoQuery._query).toMatchObject({ user })
    })
  })

  describe('withOwner', () => {
    test('When called, then it should add owner to the query attribute.', () => {
      const owner: User = new UserBuilder().withId(new mongoose.Types.ObjectId()).withName('user').build()
      const mongoQuery = new MongoQuery(Model).withOwner(owner)
      expect(mongoQuery._query).toMatchObject({ owner })
    })
  })

  describe('withTeam', () => {
    test('When called, then it should add team to the query attribute.', () => {
      const team: Team = new TeamBuilder().withId(new mongoose.Types.ObjectId()).withName('team').build()
      const mongoQuery = new MongoQuery(Model).withTeam(team)
      expect(mongoQuery._query).toMatchObject({ team })
    })
  })

  describe('withTeamOrUser', () => {
    test('When called with team specified, then it should add team to the query attribute.', () => {
      const user: User = new UserBuilder().withId(new mongoose.Types.ObjectId()).withName('user').build()
      const team: Team = new TeamBuilder().withId(new mongoose.Types.ObjectId()).withName('team').build()
      const mongoQuery = new MongoQuery(Model).withTeamOrUser(user, team)
      expect(mongoQuery._query).toMatchObject({ team })
      expect(mongoQuery._query).not.toMatchObject({ user })
    })

    test('When called without team specified, then it should add user to the query attribute.', () => {
      const user: User = new UserBuilder().withId(new mongoose.Types.ObjectId()).withName('user').build()
      const mongoQuery = new MongoQuery(Model).withTeamOrUser(user, undefined)
      expect(mongoQuery._query).toMatchObject({ user, team: { $exists: false } })
    })
  })

  describe('withTeamOrOwner', () => {
    test('When called with team specified, then it should add team to the query attribute.', () => {
      const owner: User = new UserBuilder().withId(new mongoose.Types.ObjectId()).withName('user').build()
      const team: Team = new TeamBuilder().withId(new mongoose.Types.ObjectId()).withName('team').build()
      const mongoQuery = new MongoQuery(Model).withTeamOrOwner(owner, team)
      expect(mongoQuery._query).toMatchObject({ team })
      expect(mongoQuery._query).not.toMatchObject({ owner })
    })

    test('When called without team specified, then it should add user to the query attribute.', () => {
      const owner: User = new UserBuilder().withId(new mongoose.Types.ObjectId()).withName('user').build()
      const mongoQuery = new MongoQuery(Model).withTeamOrOwner(owner, undefined)
      expect(mongoQuery._query).toMatchObject({ owner, team: { $exists: false } })
    })
  })

  describe('withFields', () => {
    test('When called, then it should add the specified fields to the query attribute.', () => {
      const fields = {
        name: 'test',
        age: 20,
        'address.stret': 'road test'
      }
      const mongoQuery = new MongoQuery(Model).withFields(fields)
      expect(mongoQuery._query).toMatchObject({ ...fields })
    })
  })

  describe('withSearch', () => {
    test('When called, then it should add a regex filter on the specified fields to the query attribute.', () => {
      const searchTerm1 = 'searchTerm-test-1'
      const searchTerm2 = 'searchTerm-test-2'
      const regex1 = new RegExp(searchTerm1, 'i')
      const regex2 = new RegExp(searchTerm2, 'i')
      const searchTerms = `${searchTerm1} ${searchTerm2}`
      const mongoQuery = new MongoQuery(Model).withSearch(['name', 'email'], searchTerms)
      expect(mongoQuery._query).toMatchObject({
        $or: [
          { name: { $regex: regex1 } },
          { name: { $regex: regex2 } },
          { email: { $regex: regex1 } },
          { email: { $regex: regex2 } }
        ]
      })
    })

    test('When called, then it should trim and add a regex filter on the specified fields to the query attribute.', () => {
      const searchTerm1 = 'searchTerm-test-1'
      const searchTerm2 = 'searchTerm-test-2'
      const regex1 = new RegExp(searchTerm1, 'i')
      const regex2 = new RegExp(searchTerm2, 'i')
      const searchTerms = `    ${searchTerm1}      ${searchTerm2}     `
      const mongoQuery = new MongoQuery(Model).withSearch(['name', 'email'], searchTerms)
      expect(mongoQuery._query).toMatchObject({
        $or: [
          { name: { $regex: regex1 } },
          { name: { $regex: regex2 } },
          { email: { $regex: regex1 } },
          { email: { $regex: regex2 } }
        ]
      })
    })

    test('When called with an empty fields array, then it should append nothing to the query attribute.', () => {
      const searchTerm = 'searchTerm-test'
      const mongoQuery = new MongoQuery(Model).withSearch([], searchTerm)
      expect(mongoQuery._query).toMatchObject({})
    })

    test('When called with an invalid string, then it should append nothing to the query attribute.', () => {
      const searchTerm = ''
      const mongoQuery = new MongoQuery(Model).withSearch(['name', 'email'], searchTerm)
      expect(mongoQuery._query).toMatchObject({})
    })

    test('When called with special characters, then it should escape them.', () => {
      const searchTerm = 'searchTerm-test+(1)'
      const excapedSearchTerm = 'searchTerm-test\\+\\(1\\)'
      const mongoQuery = new MongoQuery(Model).withSearch(['email'], searchTerm)
      expect(mongoQuery._query.$or[0].email.$regex.source).toEqual(excapedSearchTerm)
    })
  })

  describe('withExtraExactSearch', () => {
    it('should early return if _query.$or does not exist', () => {
      const mongoQuery = new MongoQuery(Model).withExtraExactSearch(['name', 'email'], 'some term')
      expect(mongoQuery._query.$or).not.toBeDefined()
    })

    it('should add exact match search terms as OR terms', () => {
      const mongoQuery = new MongoQuery(Model)
        .withSearch(['name', 'email'], 'some term')
        .withExtraExactSearch(['name', 'email'], 'some term')

      const extraExactMatches = (mongoQuery._query.$or as Record<string, string>[]).reverse()

      expect(extraExactMatches[0]).toStrictEqual({ email: 'some term' })
      expect(extraExactMatches[1]).toStrictEqual({ name: 'some term' })
    })
  })

  describe('withSort', () => {
    test('When called with a string, then it should add sort field to the sort attribute.', () => {
      const sortBy = 'name'
      const order = -1
      const mongoQuery = new MongoQuery(Model).withSort(`${sortBy} ${order}`)
      expect(mongoQuery._sort).toEqual({ [sortBy]: order })
    })

    test('When called with an empty string, then it should keep the default sort attribute.', () => {
      const mongoQuery = new MongoQuery(Model).withSort('')
      expect(mongoQuery._sort).toEqual({ createdAt: -1 })
    })
  })

  describe('withPagination', () => {
    test('When called, then it should return a MongoQueryPagination instance.', () => {
      const mongoQueryPagination = new MongoQuery(Model).withPagination()
      expect(mongoQueryPagination).toBeInstanceOf(MongoQueryPagination)
    })
  })

  describe('compile', () => {
    test('When called, then it should return the compiled query and sort.', () => {
      const user: User = new UserBuilder().withId(new mongoose.Types.ObjectId()).withName('user').build()
      const team: Team = new TeamBuilder().withId(new mongoose.Types.ObjectId()).withName('team').build()
      const fields = {
        name: 'test',
        age: 20,
        'address.stret': 'road test'
      }
      const sortBy = 'name'
      const order = -1
      const { query, sort } = new MongoQuery(Model)
        .withUser(user)
        .withTeam(team)
        .withFields(fields)
        .withSort(`${sortBy} ${order}`)
        .compile()
      expect(query).toEqual({
        user,
        team,
        ...fields
      })
      expect(sort).toEqual({ [sortBy]: order })
    })
  })
})
