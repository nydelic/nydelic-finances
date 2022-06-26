function throwIfUndefind<TEnvVar extends any>(arg: TEnvVar) {
  if (arg === undefined) {
    throw new Error(`Passed argument should not be undefined`);
  }
  return arg as Exclude<TEnvVar, undefined>;
}

export default throwIfUndefind;
