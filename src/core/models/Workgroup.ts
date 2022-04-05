import { WorkgroupSchema } from '@schemas'

export const workgroupModelName = 'Workgroup'

/**
 * MODEL METHODS
 */

function view(this: Workgroup.Document): Workgroup.View {
  return {
    _id: this._id.toHexString(),
    name: this.name,
    numberOfPatients: this.numberOfPatients,
    team: this.team.toHexString(),
    owner: String(this.owner)
  }
}

WorkgroupSchema.methods = {
  view
}

/**
 * MODEL Static Methods
 */
async function saveWorkgroup(workgroup: Workgroup.Attributes): Promise<Workgroup.Document> {
  return Workgroup.create(workgroup)
}

async function deleteWorkgroups(query: Record<string, unknown>): Promise<void> {
  await Workgroup.remove(query)
}

/**
 * @param  {QueryConditions} conditions
 * @param  {number} perPage
 * @param  {number} page
 * @param  {string} sorting
 * @returns Promise<Workgroup[]>
 */
async function findWorkgroups(
  conditions: Record<string, unknown>,
  { perPage, page }: Mongoose.PagingSpecs,
  { sorting }: Mongoose.SortingSpecs
): Promise<Workgroup.Document[]> {
  return Workgroup.find(conditions)
    .limit(perPage)
    .skip(perPage * page)
    .sort(sorting)
    .lean()
}

/**
 * @param  {QueryConditions} conditions
 * @returns Promise<number>
 */
async function countWorkgroups(conditions: Record<string, unknown>): Promise<number> {
  return Workgroup.count(conditions)
}

/**
 * Get workgroup by name and team
 * @param name the name
 * @param teamId  the team
 */
async function findByNameAndTeam(name: string, teamId: string): Promise<Workgroup.Document | null> {
  return Workgroup.findOne({ team: teamId, name: name })
}

/**
 * Get workgroup by term and team
 * @param term the term
 * @param teamId  the team
 */
async function findByTermAndTeam(term: string, teamId: string): Promise<Array<Workgroup.Document>> {
  return Workgroup.find({
    team: teamId,
    name: { $regex: new RegExp(term), $options: 'i' }
  })
}

/**
 * Get workgroup by id and team
 * @param id the id
 * @param teamId  the team
 */
async function findByIdAndTeam(id: string, teamId: string): Promise<Workgroup.Document | null> {
  return Workgroup.findOne({ _id: id, team: teamId })
}

WorkgroupSchema.statics = {
  deleteWorkgroups,
  saveWorkgroup,
  findWorkgroups,
  countWorkgroups,
  findByNameAndTeam,
  findByTermAndTeam,
  findByIdAndTeam
}

/**
 * MODEL INITIALIZATION
 */

export let Workgroup: Workgroup.Model

export const init = (connection: Mongoose.Connection): void => {
  Workgroup = connection.model<Workgroup.Document, Workgroup.Model>(workgroupModelName, WorkgroupSchema)
}
