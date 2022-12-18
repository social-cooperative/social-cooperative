import { useCallback, useEffect, useRef, useState } from "react"


import { storage, database } from '../firebase'
import { log, resizeImage, useCounter } from "../utils"


const defaultRender = src => <img src={src} />

export default ({ src, saveAs = '', databasePath = '', enabled = true, component = 'img' }) => {
  const Component = component as any
  const [editing, setEditing] = useState(true)
  const [counter, setCounter, incCounter] = useCounter(0)
  const directSrc = src?.startsWith?.('https://')
  const [path, setPath] = useState(src ? (directSrc ? src : '/loading.gif') : '/noimage.png')
  const inputRef = useRef<any>()

  const clickFileInput = useCallback(() => inputRef.current?.click?.(), [])

  const finalSrc = directSrc ? src : path

  useEffect(() => {
    if (src) {
      if (directSrc) {
        setPath(directSrc)
      } else {
        setPath('loading.gif')
        storage.ref(src).getDownloadURL().then(setPath).catch(err => setPath('/noimage.png'))
      }
    }
  }, [src, counter])
  
  const uploadOld = () => {
    const file = inputRef.current.files[0]
    const newPath = saveAs + file.type.replace(/.*\//, '.')
    if (file.size > 1024 * 1024 * 10) {
      alert('Максимальный размер файла - 10 мегабайт')
      inputRef.current.value = ''
    } else {
      storage.ref(newPath).put(file, {
        cacheControl: 'public,max-age=4000',
      }).then(() => {
        database.ref(databasePath).set(newPath).then(incCounter)
      })
    }
  }

  const upload = () => {
    const file = inputRef.current.files[0]
    const newPath = saveAs + '.webp'
    if (file.size > 1024 * 1024 * 10) {
      alert('Максимальный размер файла - 10 мегабайт')
      inputRef.current.value = ''
    } else {
      resizeImage(file, 600, file => 
        storage
          .ref(newPath)
          .put(file)
          .then(() => database.ref(databasePath).set(newPath).then(incCounter))
      )
    }
  }
  
  return (
    enabled
      ? <>
        <Component src={finalSrc} /*onDoubleClick*/ onClick={clickFileInput} />
        <input type="file" ref={inputRef} accept="image/png, image/jpeg" onChange={upload} style={{ display: 'none' }} />
      </>
      : <Component src={finalSrc} />
  )
}