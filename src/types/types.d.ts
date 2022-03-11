declare namespace App {
  interface State {}

  interface Context<Body = any> {
    request: { body: Body }
  }

  interface Config {
    port: number
  }
}
