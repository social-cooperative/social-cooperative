import { log, useToggle } from '../utils'
import { useState, useCallback } from 'react'
import { database } from '../firebase'
import styled from 'styled-components'

const Input = styled.input.attrs(({ value }) => ({ size: Math.min(String(value).length, 20) }))``

const defaultRender = value => value || '-'
const preventDefault = event => event.preventDefault()

const FirebaseEditorField = ({ value, path, children = defaultRender, enabled = true, number = false }) => {
  const [editing, toggleEditing] = useToggle(false)
  const onToggleClick = useCallback(event => { event.preventDefault(); toggleEditing() }, [])
  const onKeyDown = useCallback(event => event.key === 'Enter' && onToggleClick(event), [])
  const rename = useCallback(event => database.ref(path).set(number ? +event.target.value || 0 : event.target.value), [path])
  return enabled && editing
    ? <Input
      value={String(value) || ''}
      onChange={rename}
      onKeyDown={onKeyDown}
      onClick={preventDefault}
      onDoubleClick={preventDefault}
      onBlur={toggleEditing}
      autoFocus
    />
    : <span onDoubleClick={toggleEditing}>{children(value)}</span>
}

export default FirebaseEditorField