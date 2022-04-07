import { UserRepository } from '@core/repos'
import { TeamBuilder, UserBuilder } from 'testUtils'
import { constructWorkgroupsSearchCriteria } from './workgroupUtil'

describe('Workgroup Utils: Testing constructWorkgroupsSearchCriteria()', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const searchCriteria = [
    {
      columnHeader: 'numberOfPatients',
      value: '3'
    },
    {
      columnHeader: 'owner',
      value: 'cb-test'
    },

    {
      columnHeader: 'createdAt',
      low: '2020-11-01',
      high: '2021-03-31'
    },
    {
      columnHeader: 'test',
      high: '2021-03-31',
      value: 'test'
    },
    {
      columnHeader: 'test-1',
      high: '2021-03-31'
    }
  ]
  const team = new TeamBuilder().withName('Team').withId('1').build()
  const user = new UserBuilder().withName('User').withId('2').build()

  const mockedFindUsersFn: jest.Mock = jest.fn()

  UserRepository.getUserIdsByTerm = mockedFindUsersFn

  beforeEach(() => {
    mockedFindUsersFn.mockReturnValueOnce([user._id])
  })

  afterEach(jest.restoreAllMocks)

  test('Should return the criteria to search by', async () => {
    const criteria = await constructWorkgroupsSearchCriteria(searchCriteria, team._id as string)

    expect(criteria).toStrictEqual({
      numberOfPatients: { $in: '3' },
      owner: { $in: ['2'] },
      team: team._id,
      createdAt: {
        $gte: '2020-11-01',
        $lte: '2021-03-31'
      },
      test: {
        $in: /test/i
      },
      'test-1': {
        $lte: '2021-03-31'
      }
    })
    expect(mockedFindUsersFn).toHaveBeenCalledWith('cb-test')
  })

  test('Should return base criteria if no search criteria is passed', async () => {
    const criteria = await constructWorkgroupsSearchCriteria([], team._id as string)

    expect(criteria).toStrictEqual({
      team: team._id
    })
  })
})
