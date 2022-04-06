import { Workgroup } from '@core/models'
import { IllegalArgumentError } from 'errors'
import { cloneDeep } from 'lodash'
import mongoose from 'mongoose'
import { TeamBuilder, UserBuilder, WorkgroupBuilder } from 'testUtils'
import { WorkgroupService } from './workgroup.controller'

describe('Workgroup Controller', () => {
  const team = new TeamBuilder().withName('Team').withId(new mongoose.Types.ObjectId().toHexString()).build()
  const user = new UserBuilder().withName('User').withId(new mongoose.Types.ObjectId().toHexString()).build()

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
})
