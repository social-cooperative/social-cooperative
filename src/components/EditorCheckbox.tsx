import { useState, useCallback } from 'react'
import { Checkbox } from '@mui/material'

export const EditorCheckbox = ({ value, onSave, immediate = true, enabled = false, ...rest }) => {
  const [checked, setChecked] = useState(!!value);

  const onChange = useCallback((event) => {
    setChecked(event.target.checked);
    onSave(event.target.checked);
  }, [immediate, onSave]);

  return <Checkbox
      {...rest }
      checked={checked}
      onChange={onChange}
      disabled={!enabled}
    />
}

export default EditorCheckbox