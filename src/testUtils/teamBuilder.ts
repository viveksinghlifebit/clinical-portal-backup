export class TeamBuilder {
  private readonly item: Partial<Team>

  constructor() {
    this.item = {}
  }

  public withName(name: string): TeamBuilder {
    this.item.name = name
    return this
  }

  public withId(id: Mongoose.ObjectId): TeamBuilder {
    this.item._id = id
    return this
  }

  public build(): Team {
    return this.item as Team
  }
}
