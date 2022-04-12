export const castEnvToBoolOrUseDefault = (envVariableName: string, defaultValue: boolean): boolean => {
  return process.env[envVariableName] ? process.env[envVariableName] === 'true' : defaultValue;
};

export const requireProcessEnv = (name: string): string => {
  if (!process.env[name] || ['None', ''].includes(process.env[name] as string)) {
    throw new Error(`You must set the ${name} environment variable`);
  }
  return process.env[name] as string;
};
