import { isRef, isProxy, toRaw, isReactive } from 'vue';

export function deepToRaw<T>(val: T): T {
  if (!val || typeof val !== 'object') {
    return val;
  }

  const rawVal = isRef(val) || isProxy(val) || isReactive(val) ? toRaw(val) : val;

  if (Array.isArray(rawVal)) {
    return rawVal.map(item => deepToRaw(item)) as any;
  }

  if (rawVal instanceof Date || rawVal instanceof RegExp) {
    return rawVal;
  }

  const result: any = {};
  for (const key in rawVal) {
    if (Object.prototype.hasOwnProperty.call(rawVal, key)) {
      result[key] = deepToRaw((rawVal as any)[key]);
    }
  }

  return result;
}
