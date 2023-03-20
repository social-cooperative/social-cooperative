import { useCallback } from 'react'
import { database } from '../firebase'
import EditorCheckbox from './EditorCheckbox'

const FirebaseEditorCheckbox = ({ path, value, ...rest }) => {
  const rename = useCallback(value => setTimeout(() => database.ref(path).set(value),0), [path])
  return <EditorCheckbox {...rest} value={value} onSave={rename}/>
}

export default FirebaseEditorCheckbox
