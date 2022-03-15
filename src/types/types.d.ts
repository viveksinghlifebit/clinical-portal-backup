declare namespace App {
  interface State {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Context<Body = any> {
    request: { body: Body }
  }

  interface Config {
    port: number
    masterKey: string
    jwtSecret: string
    mongoMulti: Mongoose.Multi
  }
}
