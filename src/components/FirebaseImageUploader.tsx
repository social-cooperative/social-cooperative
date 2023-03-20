import { useCallback, useEffect, useRef, useState } from "react"


import { storage, database } from '../firebase'
import { log, resizeImage, useCounter } from "../utils"


const defaultRender = src => <img src={src} />

const pathCache = {}

export default ({ src, saveAs = '', databasePath = '', enabled = true, component = 'img' }) => {
  const Component = component as any
  const [uploadCounter, setUploadCounter, incUploadCounter] = useCounter(0)
  const directSrc = src?.startsWith?.('https://')
  const [path, _setPath] = useState(src ? (directSrc ? src : pathCache[src] || '/loading.gif') : '/noimage.png')
  const setPath = useCallback(path => {
    pathCache[src] = path
    _setPath(path)
  }, [src])
  const inputRef = useRef<any>()

  const clickFileInput = useCallback(() => inputRef.current?.click?.(), [])

  const finalSrc = directSrc ? src : path

  useEffect(() => {
    console.log(src)
    if (src) {
      if (directSrc) {
        setPath(directSrc)
      } else if (pathCache[src]) {
        setPath(pathCache[src])
      } else {
        setPath('loading.gif')
        storage.ref(src).getDownloadURL().then(setPath).catch(err => setPath('/noimage.png'))
      }
    }
  }, [src, uploadCounter, setPath])

  const upload = () => {
    const file = inputRef.current.files[0]
    const newSrc = saveAs + '.webp'
    if (file.size > 1024 * 1024 * 10) {
      alert('Максимальный размер файла - 10 мегабайт')
      inputRef.current.value = ''
    } else {
      resizeImage(file, 600, file =>
        storage
          .ref(newSrc)
          .put(file)
          .then(() => database.ref(databasePath).set(newSrc))
          .then(() => {
            pathCache[src] = null
            incUploadCounter()
          })
      )
    }
  }

  return (
    enabled
      ? <>
        <Component src={finalSrc} /*onDoubleClick*/ onClick={clickFileInput} />
        <input type="file" ref={inputRef} accept="image/png, image/jpeg, image/webp" onChange={upload} style={{ display: 'none' }} />
      </>
      : <Component src={finalSrc} />
  )
}