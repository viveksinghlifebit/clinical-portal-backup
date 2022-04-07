import { ClinicalRole } from '@core/enums'
import { PatientWorkgroup, Workgroup } from '@core/models'
import { IllegalArgumentError } from 'errors'
import { cloneDeep } from 'lodash'
import mongoose from 'mongoose'
import { TeamBuilder, UserBuilder, WorkgroupBuilder } from 'testUtils'
import { WorkgroupService } from './workgroup.controller'

describe('Workgroup Controller', () => {
  const team = new TeamBuilder().withName('Team').withId(new mongoose.Types.ObjectId().toHexString()).build()
  const user = new UserBuilder()
    .withName('User')
    .withId(new mongoose.Types.ObjectId().toHexString())
    .withRbacRoles(ClinicalRole.ReferringClinician)
    .withRbacRoles(ClinicalRole.FieldSpecialist)
    .build()

  let workgroup: Workgroup.Document
  beforeEach(() => {
    workgroup = cloneDeep(
      new WorkgroupBuilder().withName('Test Name').withTeam(String(team._id)).withOwner(String(user._id)).build()
    )
  })
  describe('createWorkgroup', () => {
    test('should create workgroup', async () => {
      const returnedWorkgroup = await WorkgroupService.createWorkgroup('Test Name', team, user)

      expect(returnedWorkgroup.name).toStrictEqual(workgroup.name)
      expect(String(returnedWorkgroup.owner)).toStrictEqual(String(workgroup.owner))
      expect(String(returnedWorkgroup.team)).toStrictEqual(String(workgroup.team))
    })
  })

  describe('deleteWorkgroup', () => {
    test('should delete the workgroup with valid workgroupId', async () => {
      const returnedWorkgroup = await WorkgroupService.createWorkgroup('Test Name', team, user)

      await WorkgroupService.deleteWorkgroup(String(returnedWorkgroup._id), String(team._id))

      const result = await Workgroup.findOne({ _id: returnedWorkgroup._id })
      expect(result).toBeNull()
    })

    test('should throw error if workgroupId is not present', async () => {
      const workgroupId = String(new mongoose.Types.ObjectId())
      await expect(WorkgroupService.deleteWorkgroup(workgroupId, String(team._id))).rejects.toThrowError(
        new IllegalArgumentError(`Cannot find workgroup with id ${workgroupId}.`)
      )
    })
  })

  describe('searchWorkgroups', () => {
    const searchCriteria = [
      {
        columnHeader: 'name',
        value: 'Test Name'
      }
    ]
    let aggregateSpy: jest.SpyInstance
    beforeEach(() => {
      aggregateSpy = jest.spyOn(PatientWorkgroup, 'aggregate')
    })

    afterEach(jest.restoreAllMocks)
    test('should return empty result if not workgroup is present', async () => {
      aggregateSpy.mockResolvedValueOnce([
        {
          workgroup: 'test',
          patients: 2
        }
      ])
      const result = await WorkgroupService.searchWorkgroups(searchCriteria, team._id.toString(), user, {})
      expect(result).toEqual({ page: 0, pages: 0, total: 0, workgroups: [] })
      expect(aggregateSpy).toHaveBeenCalled()
    })

    test('should return empty result if not workgroup is present', async () => {
      const createdWorkgroup1 = await WorkgroupService.createWorkgroup('Test Name', team, user)
      const createdWorkgroup2 = await WorkgroupService.createWorkgroup('Test Name', team, user)

      aggregateSpy.mockResolvedValueOnce([
        {
          _id: createdWorkgroup1._id,
          workgroup: 'test',
          patients: 2
        }
      ])

      const result = await WorkgroupService.searchWorkgroups(searchCriteria, team._id.toString(), user, {
        sortBy: 'createdAt',
        sortByType: 'desc'
      })
      expect(result).toEqual({
        page: 0,
        pages: 1,
        total: 2,
        workgroups: expect.arrayContaining([
          {
            _id: String(createdWorkgroup1._id),
            name: 'Test Name',
            numberOfPatients: 2,
            owner: null,
            team: team._id.toString()
          },
          {
            _id: String(createdWorkgroup2._id),
            name: 'Test Name',
            numberOfPatients: 0,
            owner: null,
            team: team._id.toString()
          }
        ])
      })
      expect(aggregateSpy).toHaveBeenCalled()
    })
  })
})
