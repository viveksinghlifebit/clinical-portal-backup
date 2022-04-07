import mongoose from 'mongoose'
import { Workgroup } from './Workgroup'
describe('Workgroup', () => {
  const getWorkgroup = (): Workgroup.Document => {
    return new Workgroup({
      _id: new mongoose.Types.ObjectId(),
      team: new mongoose.Types.ObjectId(),
      numberOfPatients: 1,
      owner: new mongoose.Types.ObjectId(),
      name: 'workgroup',
      createdAt: new Date('2021-05-24'),
      updatedAt: new Date('2021-05-26')
    })
  }
  describe('view', () => {
    test('When called, then it should transform Workgroup properly.', () => {
      const workgroup = getWorkgroup()
      expect(workgroup.view()).toEqual({
        _id: workgroup._id.toHexString(),
        team: workgroup.team.toHexString(),
        numberOfPatients: workgroup.numberOfPatients,
        owner: String(workgroup.owner),
        name: workgroup.name
      })
    })
  })

  describe('saveWorkgroup', () => {
    let mockCreate: jest.SpyInstance

    beforeAll(() => {
      mockCreate = jest.spyOn(Workgroup, 'create')
    })

    afterAll(jest.restoreAllMocks)

    test('should return created workgroup', async () => {
      mockCreate.mockResolvedValueOnce(getWorkgroup())

      const result = await Workgroup.saveWorkgroup(getWorkgroup())

      expect(result).toMatchObject(getWorkgroup())
    })
  })

  describe('deleteWorkgroups', () => {
    let mockRemove: jest.SpyInstance

    beforeAll(() => {
      mockRemove = jest.spyOn(Workgroup, 'remove')
    })

    afterAll(jest.restoreAllMocks)

    test('should return created workgroup', async () => {
      mockRemove.mockResolvedValueOnce(undefined)

      const result = await Workgroup.deleteWorkgroups({ _id: 'test' })

      expect(result).toBeUndefined()
    })
  })

  describe('findWorkgroups', () => {
    let mockFind: jest.SpyInstance

    beforeAll(() => {
      mockFind = jest.spyOn(Workgroup, 'find')
    })

    afterAll(jest.restoreAllMocks)

    test('should return workgroup', async () => {
      mockFind.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue([getWorkgroup()])
          })
        })
      })

      const result = await Workgroup.findWorkgroups({ _id: 'test' }, { perPage: 10, page: 2 }, { sorting: 'asc' })

      expect(result).toMatchObject([getWorkgroup()])
    })
  })

  describe('countWorkgroups', () => {
    let mockCount: jest.SpyInstance

    beforeAll(() => {
      mockCount = jest.spyOn(Workgroup, 'count')
    })

    afterAll(jest.restoreAllMocks)

    test('should return count of workgroup', async () => {
      mockCount.mockReturnValue(10)

      const result = await Workgroup.countWorkgroups({ _id: 'test' })

      expect(result).toBe(10)
    })
  })

  describe('findByNameAndTeam', () => {
    let mockFindOne: jest.SpyInstance

    beforeAll(() => {
      mockFindOne = jest.spyOn(Workgroup, 'findOne')
    })

    afterAll(jest.restoreAllMocks)

    test('should return count of workgroup', async () => {
      mockFindOne.mockResolvedValue(getWorkgroup())

      const result = await Workgroup.findByNameAndTeam('test', 'id')

      expect(result).toMatchObject(getWorkgroup())
    })
  })

  describe('findByTermAndTeam', () => {
    let mockFind: jest.SpyInstance

    beforeAll(() => {
      mockFind = jest.spyOn(Workgroup, 'find')
    })

    afterAll(jest.restoreAllMocks)

    test('should return count of workgroup', async () => {
      mockFind.mockResolvedValue([getWorkgroup()])

      const result = await Workgroup.findByTermAndTeam('test', 'id')

      expect(result).toMatchObject([getWorkgroup()])
    })
  })

  describe('findByIdAndTeam', () => {
    let mockFindOne: jest.SpyInstance

    beforeAll(() => {
      mockFindOne = jest.spyOn(Workgroup, 'findOne')
    })

    afterAll(jest.restoreAllMocks)

    test('should return count of workgroup', async () => {
      mockFindOne.mockResolvedValue(getWorkgroup())

      const result = await Workgroup.findByIdAndTeam('test', 'id')

      expect(result).toMatchObject(getWorkgroup())
    })
  })
})
