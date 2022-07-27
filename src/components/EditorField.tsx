import { log, useToggle } from '../utils'
import { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'

const Input = styled.input.attrs(({ value }) => ({ size: Math.min(String(value).length, 20) }))``

const defaultRender = value => value || '-'
const preventDefault = event => event.preventDefault()

export const EditorField = ({ chidlren = defaultRender, value, enabled = true, number = false, onSave, immediate = true }) => {
  const saveValue = event => number ? +event.target.value || 0 : event.target.value
  const [editing, setEditing] = useState(false)
  const [innerValue, setInnerValue] = useState(value)
  useEffect(() => {
    if (!editing && value !== innerValue)
      setInnerValue(value)
  }, [value, editing])
  const startEditing = useCallback(() => enabled && setEditing(true), [enabled])
  const stopEditing = useCallback(event => {
    if (!immediate)
      onSave(saveValue(event))
    setEditing(false)
  }, [enabled])
  const handleKeyDown = useCallback(event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      stopEditing(event)
    }
  }, [])
  const handleChange = useCallback(event => {
    setInnerValue(saveValue(event))
    if (immediate)
      onSave(saveValue(event))
  }, [immediate, onSave])
  return enabled && editing
    ? <Input
      value={innerValue || ''}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onClick={preventDefault}
      onDoubleClick={preventDefault}
      onBlur={stopEditing}
      autoFocus
    />
    : <span /*onDoubleClick*/onClick={startEditing}>{chidlren(innerValue)}</span>
}

export default EditorField