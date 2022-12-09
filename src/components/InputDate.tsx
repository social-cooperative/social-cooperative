import { useCallback } from 'react'

const InputDate = ({ value = undefined, onChnage = undefined, ...rest }) => {
  const valueStr = new Date(value).toISOString().split('T')[0]
  const onChangeCb = useCallback(e => onChnage(e.target.valueAsNumber),[onChnage])
  return <input
    type="date"
    {...rest}
    value={valueStr}
    onChange={onChangeCb}
  />
}

export default InputDate