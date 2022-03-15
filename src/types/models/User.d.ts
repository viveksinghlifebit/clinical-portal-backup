declare namespace User {
  interface Attribute {
    _id: Mongoose.ObjectId
    name: string
    surname: string
    email: string
    picture: string
  }
}
