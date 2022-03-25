interface User {
  _id: Mongoose.ObjectId | string
  name: string
  surname: string
  email: string
  picture: string
  rbacRoles?: Role.View[]
}
