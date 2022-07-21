import { createStore } from 'redux'
import { set as lodashSet } from 'lodash'
import { get as lodashGet } from 'lodash'

class Reducers {
  set(setter, state) {
    if (typeof setter === 'object') {
      if (Array.isArray(setter)) {
        const [path, value] = setter
        if (typeof value === 'function')
          return lodashSet(state, path, value(lodashGet(state, path), state))
        else
          return lodashSet(state, path, value)
      }
      else {
        for (const path in setter) {
          const value = setter[path]
          if (typeof value === 'function')
            lodashSet(state, path, value(lodashGet(state, path), state))
          else
            lodashSet(state, path, value)
        }
        return state
      }
    }
    else if (typeof setter === 'function') {
      return setter(state)
    }
  }
  toggle(path: string, state) {
    return lodashSet(state, path, !lodashGet(state, path))
  }

  select([type, uuid], state) {
    if (uuid === state.selected[type])
      uuid = null
    return { selected: { ...state.selected, [type]: uuid } }
  }
}

const reducers = new Reducers()

const default_state = {
  user: undefined,
  claims: {},
}

function rootReducer(state = default_state, action) {
  if (reducers[action.type]) {
    const transform = reducers[action.type](action.value, state, action)
    return { ...state, ...transform }
  } else return state
}

export const store = createStore(rootReducer)
export const dispatch = <R extends keyof Reducers>(
  type: R,
  value: Parameters<Reducers[R]>[0]
) => store.dispatch({ type, value })

import { Provider as Provider_ } from 'react-redux'

export const Provider = props => <Provider_ store={store} {...props} />