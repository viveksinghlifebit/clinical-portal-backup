import { ClinicalRole } from '@core/enums'
import { PatientWorkgroup, Workgroup } from '@core/models'
import { UserRepository } from '@core/repos'
import { IllegalArgumentError } from 'errors'
import { keyBy } from 'lodash'
import { constructWorkgroupsSearchCriteria } from 'utils'

export class WorkgroupService {
  /**
   * Creates the workgroup.
   * @param name  the name
   * @param team  the team
   * @param user  the user
   */
  static async createWorkgroup(name: string, team: Team, user: User): Promise<Workgroup.Document> {
    return Workgroup.saveWorkgroup({
      name,
      numberOfPatients: 0,
      owner: user._id as Mongoose.ObjectId,
      team: team._id as Mongoose.ObjectId
    })
  }

  /**
   * Deletes a workgroup and it's associated patients
   *
   * @param  {string} workgroupId
   * @param  {Team} teamId
   * @returns Promise
   */
  static async deleteWorkgroup(workgroupId: string, teamId: string): Promise<void> {
    const workgroup = await Workgroup.findByIdAndTeam(workgroupId, teamId)
    if (!workgroup) {
      throw new IllegalArgumentError(`Cannot find workgroup with id ${workgroupId}.`)
    }
    await Workgroup.deleteWorkgroups({ _id: workgroupId, team: teamId })
    await PatientWorkgroup.remove({ workgroup: workgroupId })
  }

  /**
   * Search workgroups paginated
   *
   * @param  {SearchItem[]} searchCriteria
   * @param  {string} teamId
   * @param  {string} pageNumber
   * @param  {string} pageSize
   * @param  {string} sortBy
   * @param  {string} sortByType
   * @returns Promise<WorkgroupSearchData>
   */
  static async searchWorkgroups(
    searchCriteria: Filter.SearchItem[],
    teamId: string,
    user: User,
    { pageNumber, pageSize, sortBy, sortByType }: App.SearchPagingSpecs
  ): Promise<Workgroup.SearchData> {
    const perPage = pageSize ?? 20
    const page = pageNumber ?? 0
    const sort = sortBy && sortByType ? { [sortBy]: sortByType } : { createdAt: -1 }
    const criteria = await constructWorkgroupsSearchCriteria(searchCriteria, teamId)
    const allWorkgroups = await Workgroup.findWorkgroups(criteria, { perPage, page }, { sorting: sort })
    let workgroups = allWorkgroups.map((workgroup) => workgroup.view())
    const count = await Workgroup.countWorkgroups(criteria)
    let numberOfPages = 0
    if (count % perPage === 0) {
      numberOfPages = count / perPage
    } else {
      numberOfPages = Math.ceil(count / perPage)
    }
    if (
      user.rbacRoles &&
      user.rbacRoles.every(({ name }) =>
        [ClinicalRole.ReferringClinician, ClinicalRole.FieldSpecialist].includes(name as ClinicalRole)
      )
    ) {
      const workgroupIds = workgroups.map(({ _id }) => _id)
      const workgroupWithPatientCounts = await PatientWorkgroup.getRefererredPatientsCountWithWorkGroup(
        workgroupIds,
        user
      )
      const workgroupPatientCounts = keyBy(workgroupWithPatientCounts, '_id')
      workgroups = workgroups.map((workgroup) => ({
        ...workgroup,
        numberOfPatients: workgroupPatientCounts[String(workgroup._id)]?.patients ?? 0
      }))
    }
    await WorkgroupService.populateWorkgroups(workgroups)

    return {
      total: count,
      page: page,
      pages: numberOfPages,
      workgroups: workgroups
    }
  }

  /**
   * Populates workgroups with owners
   *
   * @param  {Workgroup[]} workgroups
   * @returns Promise<Workgroup[]>
   */
  static async populateWorkgroups(workgroups: Workgroup.View[]): Promise<Workgroup.View[]> {
    const promises = workgroups.map((item) => WorkgroupService.populateWorkgroupWithOwner(item))

    return Promise.all(promises)
  }

  /**
   * Populates workgroup with it's owner
   *
   * @param  {Workgroup} workgroup
   * @returns Promise<Workgroup>
   */
  static async populateWorkgroupWithOwner(workgroup: Workgroup.View): Promise<Workgroup.View> {
    const user = await UserRepository.findById(workgroup.owner as string, { password: 0 })
    workgroup.owner = user as User
    return workgroup
  }
}
