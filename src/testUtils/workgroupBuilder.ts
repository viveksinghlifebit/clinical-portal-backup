import mongoose from 'mongoose'

export class WorkgroupBuilder {
  private readonly item: Partial<Workgroup.Document>

  constructor() {
    this.item = {}
  }

  public withId(id: string): WorkgroupBuilder {
    this.item._id = id
    return this
  }

  public withName(name: string): WorkgroupBuilder {
    this.item.name = name
    return this
  }

  public withTeam(team: string): WorkgroupBuilder {
    this.item.team = (team as unknown) as mongoose.Types.ObjectId
    return this
  }

  public withOwner(owner: string): WorkgroupBuilder {
    this.item.owner = (owner as unknown) as mongoose.Types.ObjectId
    return this
  }

  public withNumberOfPatients(numberOfPatients: number): WorkgroupBuilder {
    this.item.numberOfPatients = numberOfPatients
    return this
  }

  public build(): Workgroup.Document {
    return this.item as Workgroup.Document
  }
}
