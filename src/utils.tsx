import { useCallback, useEffect, useMemo, useState } from 'react'
import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

const cx_flatten = (from, to = []) => {
  if (typeof from === 'string' || from instanceof String)
    to.push(from)
  else if (from && typeof from === 'object')
    if (typeof from[Symbol.iterator] === 'function')
      for (const item of from)
        cx_flatten(item, to)
    else
      for (const key in from)
        if (from[key])
          to.push(key)
  return to
}

export const cx = (...args) => cx_flatten(args).join(' ')


export const _switch = (cases, defaultCase) => value => {
  if (value in cases) return cases[value]
  return defaultCase
}

export const log = (...args) => (console.log(...args), args[0])


export function dateAdd(date, interval, units) {
  if (!(date instanceof Date))
    return undefined
  let ret = new Date(date) //don't change original date
  const checkRollover = function () { if (ret.getDate() != date.getDate()) ret.setDate(0) }
  switch (String(interval).toLowerCase()) {
    case 'year': ret.setFullYear(ret.getFullYear() + units); checkRollover(); break
    case 'quarter': ret.setMonth(ret.getMonth() + 3 * units); checkRollover(); break
    case 'month': ret.setMonth(ret.getMonth() + units); checkRollover(); break
    case 'week': ret.setDate(ret.getDate() + 7 * units); break
    case 'day': ret.setDate(ret.getDate() + units); break
    case 'hour': ret.setTime(ret.getTime() + units * 3600000); break
    case 'minute': ret.setTime(ret.getTime() + units * 60000); break
    case 'second': ret.setTime(ret.getTime() + units * 1000); break
    default: ret = undefined; break
  }
  return ret
}

export const sleep = ms => new Promise(r => setTimeout(r, ms))



const importedStyles = new Set()

export function stylize(nameOrUrl, content?) {
  if (!importedStyles.has(nameOrUrl)) {
    importedStyles.add(nameOrUrl)
    const style = document.createElement('style')
    style.innerHTML = content ? content : `@import url(${nameOrUrl});`
    document.head.appendChild(style)
  }
  else
    console.warn('attempted styles reimport for', nameOrUrl)
}

const createdStyles = new Map()
const createdStylesCounts = new Map()
export function Stylize({
  name = undefined,
  url = undefined,
  children = null
}) {
  useEffect(() => {
    let styleElement = createdStyles.get(name || url)
    let count = createdStylesCounts.get(name || url)
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.innerHTML = children ? children : `@import url(${url});`
      createdStyles.set(name || url, styleElement)
      createdStylesCounts.set(name || url, 0)
      count = 0
    }

    count += 1
    createdStylesCounts.set(name || url, count)
    styleElement.dataset.count = count

    if (count === 1)
      document.head.appendChild(styleElement)

    return () => {
      const count = createdStylesCounts.get(name || url)
      createdStylesCounts.set(name || url, count - 1)
      if (count === 1)
        document.head.removeChild(styleElement)
    }
  }, [name, url, children])
  return null
}

const Nothing = () => null
const Children = ({ children }) => typeof children === 'function' ? children() : children
export function usePromise(asyncFunction, dependencies = []) {
  const [state, setState] = useState(() => ({
    fulfilled: false,
    rejected: false,
    settled: false,
    pending: true,
    reason: undefined,
    value: undefined,
    Loading: (({ pending: Pending = Nothing }) => <Pending />) as any
  }))
  useEffect(() => {
    asyncFunction().then(
      value => setState(state => ({
        ...state,
        value,
        pending: false,
        fulfilled: true,
        settled: true,
        Loading: Children
      })),
      reason => setState(state => ({
        ...state,
        reason,
        pending: false,
        rejected: true,
        settled: true,
        Loading: () => { throw new Error(reason) }
      }))
    )
  }, [...dependencies])
  return state
}


export const asciify = str => str.replace(/\W/g, '').toLowerCase()

const idCounters = {}
export function claim_id(name = 'id') {
  if (!idCounters[name]) idCounters[name] = 0
  return asciify(name) + '_' + idCounters[name]++
}

export function parsePromptField(desc) {
  let name
  let type
  let message

  switch (desc[0]) {
    case '^': type = 'button'; break
    case '*': type = 'password'; break
    case '#': type = 'number'; break
    case '~': type = 'boolean'; break
    default: type = 'text'
  }

  if (type !== 'text') desc = desc.slice(1)

  const descPair = desc.split(':')
  if (descPair.length === 2) {
    message = descPair[1]
    name = descPair[0]
  } else {
    message = descPair[0]
    name = asciify(descPair[0])
  }

  return { name, type, message }
}

export const unbitmap_k = (value, bitmap) => Object.fromEntries(
  Object.entries(bitmap).filter(v => value & +v[0])
)
export const unbitmap_v = (value, bitmap) => Object.fromEntries(
  Object.entries(bitmap).filter(v => value & +v[1])
)

type GenericFunction = (...args) => any
export const call = <T extends GenericFunction>(fn: T) => fn() as ReturnType<T>
export const proxy_fn = <T extends GenericFunction>(fn: T) => ((...args) => fn(...args)) as T

import { EventEmitter } from 'events'
export type TinyEventEmitter = {
  on: (event: any, callback: any) => any,
  once: (event: any, callback: any) => any,
  off: (event: any, callback: any) => any,
  emit?: (event: string | symbol, ...args: any[]) => boolean
}

EventEmitter.captureRejections = true

type Listener = (...args: any[]) => void

const subscribe_one = (emitter: TinyEventEmitter, event: string, func: Listener) => {
  emitter.on(event, func)
  return () => emitter.off(event, func)
}

export const subscribe = (
  emitter: TinyEventEmitter,
  event: string, func: Listener,
  ...morelisteners: any
) => {
  if (!morelisteners.length)
    return subscribe_one(emitter, event, func)
  const unsubbers = [subscribe_one(emitter, event, func)]
  for (let i = 0; morelisteners[i + 1]; i += 2)
    unsubbers.push(subscribe_one(emitter, morelisteners[i], morelisteners[i + 1]))
  return () => unsubbers.forEach(call)
}

export const subscribeOnce = (emitter: TinyEventEmitter, event: string, func: Listener) => {
  emitter.once(event, func)
  return () => emitter.off(event, func)
}

export const once = (
  emitter: TinyEventEmitter,
  event: string,
  check?: (...arg: any) => any,
  transform?: (...arg: any) => any,
) => {
  return new Promise((resolve, reject) => {
    const listen = (...args) => {
      if (!check || check(...args)) {
        emitter.off('error', reject)
        resolve(transform ? transform(...args) : args[0])
      }
      else emitter.once(event, listen)
    }
    emitter.once(event, listen)
    emitter.once('error', reject)
  }) as Promise<any>
}

export const assert_one = (value, error) => {
  if (value instanceof Promise)
    return value.then(v => assert(v, error))
  if (value)
    return value
  else
    throw new Error(error || 'Assertion failed')
}

export const assert = (value, error, ...more) => {
  if (!more.length)
    return assert_one(value, error)
  let assertion = assert_one(value, error)
  let is_async = assertion instanceof Promise
  const assertions = [assertion]
  for (let i = 0; i < more.length; i += 2) {
    assertion = assert_one(more[i], more[i + 1])
    is_async = is_async || assertion instanceof Promise
    assertions.push(assertion)
  }
  if (is_async)
    return Promise.all(assertions)
  else
    return assertions
}

export const stub = (...args: any) => undefined as any
export const identity = v => v
export const refEqual = (a, b) => a === b
export const useMap = (initialItems = [], onAdd?, onRemove?) => {
  const [{ raw, mapped }, setState] = useState(() => ({
    raw: [...initialItems],
    mapped: onAdd ? initialItems.map(onAdd) : [...initialItems]
  }))
  const addItems = useCallback((...items) => setState(({ raw, mapped }) => ({
    raw: [...raw, ...items],
    mapped: [...mapped, ...(onAdd ? items.map(onAdd) : items)]
  })), [onAdd])
  const removeItems = useCallback((...items) => setState(({ raw, mapped }) => {
    const raw_ = [...raw]
    const mapped_ = [...mapped]
    for (const item of items) {
      const index = raw_.indexOf(item)
      raw_.splice(index, 1)
      mapped_.splice(index, 1)
      if (onRemove) onRemove(mapped_[index], raw_[index])
    }
    return { raw: raw_, mapped: mapped_ }
  }), [onRemove])
  return [mapped as any, addItems, removeItems]
}

export function repeatRetryUntilTimeout(repeat, until, timeout = Infinity, retryLimit = Infinity, currentLimit = 0) {
  if (currentLimit >= retryLimit) return Promise.reject(new Error(
    `repeatRetryUntilTimeout hit retry limit of ${currentLimit} out of ${retryLimit} in:\n\trepeat ${repeat}\n\tuntil ${until}`
  ))
  return new Promise((resolve, reject) => {
    if (repeat) {
      try {
        const repeated = repeat()
        if (repeated instanceof Promise)
          repeated.catch(reject)
      } catch (e) {
        reject(e)
      }
    }
    until().then(resolve).catch(reject)
    if (timeout !== Infinity) setTimeout(reject, timeout)
  }).catch(reason => {
    if (reason instanceof Error)
      throw reason
    else
      return repeatRetryUntilTimeout(repeat, until, timeout, retryLimit, currentLimit + 1)
  })
}

const minus = (a, b, arr) => {
  if (arr) {
    const c = new Array(a.length)
    for (let i = 0; i < a.length; i++)
      c[i] = a[i] - b[i]
    return c
  }
  else return a - b
}
const plus_scaled = (a, b, scale, deltaIgnore, arr) => {
  if (arr) {
    const c = new Array(a.length)
    for (let i = 0; i < a.length; i++) {
      if (Math.abs(b[i]) <= deltaIgnore)
        c[i] = a[i]
      else
        c[i] = a[i] + b[i] * scale
    }
    return c
  }
  else {
    if (Math.abs(b) <= deltaIgnore)
      return a
    else
      return a + b * scale
  }
}

export const interpolate = (delta = 0) => {
  let arr
  let deltaIgnore = delta
  let prevTime
  let currTime
  let diffTime
  let prevPos
  let currPos
  let diffPos
  const next = (nextPos) => {
    arr = Array.isArray(nextPos)
    prevTime = currTime
    currTime = process.hrtime.bigint()
    prevPos = currPos
    currPos = nextPos
    if (!prevTime) {
      prevTime = currTime
      prevPos = currPos
    }
    diffTime = Number(currTime - prevTime)
    diffPos = minus(currPos, prevPos, arr)
  }
  const now = () => {
    if (!prevTime) return undefined
    const nowTime = process.hrtime.bigint()
    const nowDiffTime = Number(nowTime - currTime)
    const nowFracTime = diffTime ? nowDiffTime / diffTime : 0
    const nowPos = plus_scaled(currPos, diffPos, nowFracTime, deltaIgnore, arr)
    return nowPos
  }
  return { next, now }
}

export const proxy_events = (source: TinyEventEmitter, dest: TinyEventEmitter, ...events: string[]) => {
  const listeners = events.map(e => (...args) => dest.emit(e, ...args))
  events.forEach((e, i) => source.on(e, listeners[i]))
  return () => events.forEach((e, i) => source.off(e, listeners[i]))
}

import { useSelector as _useSelector, shallowEqual, useStore } from 'react-redux'
import { defaultClassName } from 'react-mapbox-gl/lib/popup'
import { database } from './firebase'

export function useSelector(selector = identity, comparator: typeof shallowEqual | false = shallowEqual) {
  return _useSelector(selector, comparator || refEqual)
}

/*
// Memoized cool useSelector, but its semantics do not allow for prop
// dependant selector logic
export function useSelector(selector = identity, comparator = shallowEqual) {
  const store = useStore()
  const [selected, setSelected] = useState(() => selector(store.getState()))
  useEffect(() => {
    return store.subscribe(() => setSelected(prevSelected => {
      const newSelected = selector(store.getState())
      const same = comparator
        ? comparator(prevSelected, newSelected)
        : prevSelected === newSelected
      if (!same) setSelected(newSelected)
    }))
  })
  return selected
}
*/

export const useLocalStorageState = (item, initalValue = null, initialize = false) => {
  const [value, _setValue] = useState(() => {
    let value = localStorage.getItem(item)
    value = value ? JSON.parse(value) : undefined
    if (value === undefined) {
      value = typeof initalValue === 'function' ? initalValue() : initalValue
      if (initialize && value !== undefined)
        localStorage.setItem(item, JSON.stringify(value))
    }
    return value
  })
  const setValue = useCallback(value => {
    _setValue(prevValue => {
      if (typeof value === 'function') value = value(prevValue)
      if (value === undefined)
        localStorage.removeItem(item)
      else
        localStorage.setItem(item, JSON.stringify(value))
      return value
    })
  }, [])
  return [value, setValue] as [any, typeof setValue]
}

export const useToggle = (initial) => {
  const [value, set] = useState(initial)
  return [value, useCallback(() => set(v => !v), [])]
}

export function useDispatch(_dispatchers = [], memo?): any {
  const store = useStore()
  const [dispatch, dispatchers] = useMemo(() => {
    const dispatch = (type, value) => store.dispatch({ type, value })
    return [dispatch, _dispatchers.map(d => d(dispatch))]
  }, memo && [store, ...memo])
  if (dispatchers.length)
    return [...dispatchers, dispatch]
  else
    return dispatch
}

export function useRedux(selector = identity, comparator = shallowEqual) {
  return [useSelector(selector, comparator), useDispatch()]
}

export const useInputState = (initialState = '') => {
  const [value, setValue] = useState(initialState)
  const setOnChange = useCallback(event => setValue(event.target.value), [])
  return [value, setOnChange, setValue] as [typeof value, typeof setOnChange, typeof setValue]
}

export const unsubs = () => {
  const unsubbers = []
  return (fn?: GenericFunction) => {
    if (fn) unsubbers.push(fn)
    else return () => unsubbers.forEach(call)
  }
}

export const throttledTimeout = (func?: GenericFunction, ms?: number) => {
  let id = null
  return (_func?: GenericFunction, _ms?: number) => {
    clearTimeout(id)
    const local_id = setTimeout(
      _func || func,
      typeof _ms === 'number' ? _ms : ms
    )
    id = local_id
    return () => clearTimeout(local_id)
  }
}
export const throttledInterval = (func?: GenericFunction, ms?: number) => {
  let id = null
  return (_func?: GenericFunction, _ms?: number) => {
    clearInterval(id)
    const local_id = setInterval(
      _func || func,
      typeof _ms === 'number' ? _ms : ms
    )
    id = local_id
    return () => clearInterval(local_id)
  }
}

export const interval = (fn: GenericFunction, ms: number, immediate = false) => {
  if (immediate) fn()
  const id = setInterval(fn, ms)
  return () => clearInterval(id)
}

export const timeout = (fn: GenericFunction, ms: number) => {
  const id = setTimeout(fn, ms)
  return () => clearTimeout(id)
}

export const immediate = (fn: GenericFunction, ms: number) => {
  const id = setImmediate(fn, ms)
  return () => clearImmediate(id)
}

export const empty = obj => !Object.keys(obj).length

export const useCounter = (initial, min = -Infinity, max = Infinity) => {
  const [num, setNum] = useState(initial || 0)
  const inc = useCallback(() => setNum(v => v + 1 > max ? max : v + 1), [max])
  const dec = useCallback(() => setNum(v => v - 1 < min ? min : v - 1), [min])
  return [num, setNum, inc, dec]
}

export const hash = str => {
  let hash = 0, i, chr
  if (str.length === 0) return hash
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}


export const productsTotal = products => {
  if (!(products && typeof products === 'object'))
    return 0
  if (products.count && products.product?.price)
    return products.count * products.product.price
  if (!Array.isArray(products))
    products = Object.values(products)
  return products.reduce((acc, v) => acc += v.count * v.product.price, 0)
}

const dateRuConfig = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
} as any

export const toLocaleStringRu = date => {
  if (date instanceof Date)
    return date.toLocaleString('ru-RU', dateRuConfig)
  else
    return new Date(date).toLocaleString('ru-RU', dateRuConfig)
}

export const toCurrencyStringRu = num =>  new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currencyDisplay:'symbol',
  currency: 'RUB'
}).format(num).replace(',00 ₽', ' ₽')

export const useFirebaseValue = (path, defaultValue = undefined, transform = identity) => {
  const [value, setValue] = useState(defaultValue as any)
  const ref = database.ref(path)
  useEffect(() => subscribe(
    ref, 'value',
    snap => setValue(transform(snap.val()))
  ), [path, transform])
  return value
}

export const useFirebaseState = (path, defaultValue = undefined, transform = identity) => {
  const [value, setValue] = useState(defaultValue as any)
  const ref = database.ref(path)
  useEffect(() => subscribe(
    ref, 'value',
    snap => setValue(transform(snap.val()))
  ), [path, transform])
  const set = useCallback(async newValue => {
    if (typeof newValue === 'function')
      return await ref.get()
        .then(snap => snap.val())
        .then(v => ref.set(newValue(v)))
    else
      return await ref.set(newValue)
  }, [path])
  const update = useCallback(async newValue => {
    if (typeof newValue === 'function')
      return await ref.get()
        .then(snap => snap.val())
        .then(v => ref.update(newValue(v)))
    else
      return await ref.update(newValue)
  }, [path])
  return [value, set, update]
}

export const resizeImage = (file, max_size, cb) => {
  if (file.type.match(/image.*/)) {
    const reader = new FileReader()
    reader.onload = event => {
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        let width = image.width
        let height = image.height
        if (width > height) {
          if (width > max_size) {
            height *= max_size / width
            width = max_size
          }
        } else {
          if (height > max_size) {
            width *= max_size / height
            height = max_size
          }
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(image, 0, 0, width, height)
        canvas.toBlob(blob =>
          cb(new File([blob], file.name, { type: 'image/webp' }))
        , 'image/webp')
      }
      //@ts-ignore
      image.src = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

dayjs.extend(localizedFormat)

export const locilizeDate = (date: number | string | Date) => dayjs(date).locale('ru').format('DD MMMM, dddd, HH:mm');