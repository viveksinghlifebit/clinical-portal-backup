import { ClinicalRole } from '@core/enums';

export class UserBuilder {
  private readonly item: Partial<User>;

  constructor() {
    this.item = {
      rbacRoles: []
    };
  }

  public withName(name: string): UserBuilder {
    this.item.name = name;
    return this;
  }

  public withSurname(surname: string): UserBuilder {
    this.item.surname = surname;
    return this;
  }

  public withId(id: string): UserBuilder {
    this.item._id = id;
    return this;
  }

  public withRbacRoles(clinicalRole: ClinicalRole): UserBuilder {
    this.item.rbacRoles = this.item.rbacRoles?.concat({
      displayName: clinicalRole,
      name: clinicalRole,
      permissions: []
    });
    return this;
  }

  public build(): User {
    return this.item as User;
  }
}
