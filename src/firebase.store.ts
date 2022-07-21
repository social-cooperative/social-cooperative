import type firebase from 'firebase/app'
import { shallowEqual } from 'react-redux'
import { database, onLogin } from './firebase'
import { dispatch, store } from './store'
import { log, unsubs, interval } from './utils'

const tryParse = json => {
  try { return JSON.parse(json) } catch { }
}

const selectedSaved = tryParse(localStorage.getItem('store:selected') || '{}')
let selectedSavedCurrent = selectedSaved

let performedInitialSelect = {}
store.subscribe(() => {
  const { selected } = store.getState()
  if (!shallowEqual(selected, selectedSavedCurrent)) {
    selectedSavedCurrent = selected
    localStorage.setItem('store:selected', JSON.stringify(selectedSavedCurrent))
  }
})
const attemptInitialSelect = (type, uuid) => {
  if (!performedInitialSelect[type] && uuid === selectedSaved[type]) {
    performedInitialSelect[type] = true
    dispatch('select', [type, uuid])
  }
  /*
  else if (uuid === selectedSavedCurrent) {
    dispatch('set', { selected_drone: drone })
  }
  */
}

const dbsub = (
  path: string,
  callback: (snap: firebase.database.DataSnapshot) => (() => any) | void,
  uneffectOnUpdate = true
) => {
  const ref = database.ref(path)
  let uneffect
  const onValue = snap => {
    if (uneffectOnUpdate) uneffect?.()
    uneffect = callback(snap)
  }
  ref.on('value', onValue)
  return () => {
    ref.off('value', onValue)
    uneffect?.()
    uneffect = null
  }
}

const dbsubChilds = (
  parent: firebase.database.DataSnapshot,
  name: string,
  callback: (snap: firebase.database.DataSnapshot) => (() => any) | void,
  uneffectOnUpdate = true
) => {
  const unsub = unsubs()
  const childs = parent.val()[name]
  for (const uuid in childs)
    unsub(dbsub(`/${name}/${uuid}`, callback, uneffectOnUpdate))
  return unsub()
}

const dbsubCascade = (
  current: string,
  cascade: string[],
  callback: (snap: firebase.database.DataSnapshot) => (() => any) | void,
  uneffectOnUpdate = true
) => dbsub(
  current,
  cascade.length ? snap => {
    const unsub = unsubs()
    const map = snap.val() || {}
    for (const key in map)
      unsub(dbsubCascade(`${cascade[0]}/${key}`, cascade.slice(1), callback, uneffectOnUpdate))
    return unsub()
  } : callback,
  uneffectOnUpdate
)

const dbattach = (type: string) => (snap: firebase.database.DataSnapshot) => {
  const value = snap.val()
  if (value && typeof value === 'object')
    value.uuid = snap.key
  return attach(type, snap.key, value)
}

const attach = (type: string, key: string, val) => {
  dispatch('set', [type, state => ({ ...state, [key]: val })])
  return () =>
    dispatch('set', [type, state => ({ ...state, [key]: null })])
}
