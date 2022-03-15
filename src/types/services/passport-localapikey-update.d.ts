declare module 'passport-localapikey-update' {
  export class Strategy {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authenticate: (req: any, options: any) => void

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(StrategyCallback: (apikey: any, done: any) => Promise<any>)
  }
}
