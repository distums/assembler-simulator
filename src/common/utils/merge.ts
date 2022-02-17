import type { O } from 'ts-toolbelt'
import type { ExpandDeep } from './index'

const getType = (val: unknown): string => Object.prototype.toString.call(val).slice(8, -1)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PlainObject = Record<string | number | symbol, any>

const isPlainObject = (val: unknown): val is PlainObject => getType(val) === 'Object'

const mergeRecursively = (target: unknown, source: PlainObject): PlainObject => {
  const resultObject: PlainObject = {}
  const sourcePropertyNames = Object.getOwnPropertyNames(source)
  const sourcePropertySymbols = Object.getOwnPropertySymbols(source)
  const isTargetPlainObject = isPlainObject(target)
  if (isTargetPlainObject) {
    const targetPropertyNames = Object.getOwnPropertyNames(target)
    const targetPropertySymbols = Object.getOwnPropertySymbols(target)
    const assignTargetProperty = (key: string | symbol): void => {
      const isKeySymbol = typeof key === 'symbol'
      if (
        (!isKeySymbol && !sourcePropertyNames.includes(key)) ||
        (isKeySymbol && !sourcePropertySymbols.includes(key))
      ) {
        resultObject[key] = target[key]
      }
    }
    targetPropertyNames.forEach(assignTargetProperty)
    targetPropertySymbols.forEach(assignTargetProperty)
  }
  const assignSourceProperty = (key: string | symbol): void => {
    let sourceVal = source[key]
    if (isTargetPlainObject && isPlainObject(sourceVal)) {
      sourceVal = mergeRecursively(target[key], sourceVal)
    }
    resultObject[key] = sourceVal
  }
  sourcePropertyNames.forEach(assignSourceProperty)
  sourcePropertySymbols.forEach(assignSourceProperty)
  return resultObject
}

/**
 * Modified from <https://github.com/mesqueeb/merge-anything/blob/e492bfc05b2b333a5c6316e0dbc8953752eafe07/src/merge.ts>
 */
export const merge = <TTarget extends PlainObject, TSources extends PlainObject[]>(
  target: TTarget,
  ...sources: TSources
): ExpandDeep<O.Assign<TTarget, TSources, 'deep'>> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources.reduce((resultObject, source) => mergeRecursively(resultObject, source), target) as any
