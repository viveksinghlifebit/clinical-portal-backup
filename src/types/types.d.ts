declare namespace App {
  interface State {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Context<Body = any> {
    request: { body: Body }
  }

  interface Config {
    port: number
  }
}
