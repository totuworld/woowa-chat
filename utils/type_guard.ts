const isOfType = <T>(varToBeChecked: unknown, propertyToCheckFor: keyof T): varToBeChecked is T =>
  (varToBeChecked as T)[propertyToCheckFor] !== undefined;

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export default isOfType;
