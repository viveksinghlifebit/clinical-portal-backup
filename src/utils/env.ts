export const castEnvToBoolOrUseDefault = (envVariableName: string, defaultValue: boolean): boolean => {
  return process.env[envVariableName] ? process.env[envVariableName] === 'true' : defaultValue
}
