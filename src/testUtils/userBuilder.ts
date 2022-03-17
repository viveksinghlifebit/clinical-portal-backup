export class UserBuilder {
  private readonly item: Partial<User>

  constructor() {
    this.item = {}
  }

  public withName(name: string): UserBuilder {
    this.item.name = name
    return this
  }

  public withSurname(surname: string): UserBuilder {
    this.item.surname = surname
    return this
  }

  public withId(id: Mongoose.ObjectId): UserBuilder {
    this.item._id = id
    return this
  }

  public build(): User {
    return this.item as User
  }
}
