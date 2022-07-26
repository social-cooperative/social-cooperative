import { useCallback } from 'react'
import { database } from '../firebase'

import EditorField from './EditorField'

const FirebaseEditorField = ({ path, value, ...rest }) => {
  const rename = useCallback(value => database.ref(path).set(value), [path])
  return <EditorField {...rest} value={value} onSave={rename}/>
}

export default FirebaseEditorField