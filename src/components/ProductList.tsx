import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import styled from 'styled-components'

import { auth, database } from '../firebase'
import { Table, CellImg } from './Table'

const Root = styled.div`
  padding: 1em;
`


const adminSelector = store => !!store.claims.admin

const Product = props => {
  const [editing, toggleEditing] = useToggle(false)
  const admin = useSelector(adminSelector)
  const [count, setCount, incCount, decCount] = useCounter(1, 1)
  const { model } = props

  const addToBasket = useCallback(() => {
    const slug = model.id + '|' + hash(model.name + model.unit + model.price)

    const cartRef = database.ref(`carts/${auth.currentUser.uid}`)

    cartRef.child(slug).get().then(snap => {
      const inCart = snap.val()
      if (inCart) {
        inCart.count += count
        inCart.total += count * model.price
        cartRef.child(slug).set(inCart)
      } else {
        cartRef.child(slug).set({
          product: model,
          count: count,
          total: count * model.price,
        })
      }
    })
  }, [count])

  const canBuy = !!model.price

  return (
    <tr className="product" style={{ background: props.darker ? '#eeeeee' : undefined }}>
      <td className="image">
        <FirebaseImageUploader src={model.image} saveAs={`products/${model.id}`} databasePath={`/products/${model.id}/image`} component={CellImg} />
      </td><td>
        <Typography variant="h6">
          <FirebaseEditorField path={`/products/${model.id}/name`} value={model.name} enabled={admin} />
        </Typography>
      </td><td>
        <Typography variant="h6">
          <FirebaseEditorField path={`/products/${model.id}/price`} value={model.price} enabled={admin} number>
            {price => price ? String(price).replace('.', ',') + 'р.' : '-'}
          </FirebaseEditorField>
        </Typography>
      </td><td>
        <Typography variant="h6">
          <FirebaseEditorField path={`/products/${model.id}/unit`} value={model.unit} enabled={admin} />
        </Typography>
      </td><td>
        <Typography>
          <FirebaseEditorField path={`/products/${model.id}/comment`} value={model.comment} enabled={admin} />
        </Typography>
      </td><td>
        <input disabled={!canBuy} size={11} style={{ display: 'block', textAlign: 'center' }} value={canBuy ? count : 'Нет в наличии'} readOnly />
        <div style={{ display: 'flex' }}>
          <button disabled={!canBuy} style={{ width: 25 }} onClick={incCount}>+</button>
          <button disabled={!canBuy} style={{ width: 25 }} onClick={decCount}>-</button>
          <button disabled={!canBuy} style={{ flex: 1 }} onClick={addToBasket}><small>В корзину</small></button>
        </div>
      </td>{admin && <td>
        <Typography>
          <FirebaseEditorField path={`/products/${model.id}/commentInternal`} value={model.commentInternal} enabled={admin} />
        </Typography>
      </td>}
    </tr>
  )
}

import products from '../products'
import { hash, log, subscribe, useCounter, useSelector, useToggle } from '../utils'
import React, { useCallback, useEffect, useState } from 'react'
import FirebaseEditorField from './FirebaseEditorField'
import FirebaseImageUploader from './FirebaseImageUploader'

const categorize = products => products.reduce((acc, v) => ((acc[v.category] ? acc[v.category].push(v) : (acc[v.category] = [v])), acc), {}) as any

export default () => {
  const admin = useSelector(adminSelector)
  const [products, setProducts] = useState([])
  useEffect(() => subscribe(database.ref('products'), 'value', snap => setProducts(categorize(Object.entries<any>(snap.val()).map(([k, v]) => (v.id = k, v))))), [])

  return (
    <Root>
      <Typography variant="h4">Каталог</Typography>
      <Table>
        <thead>
          <tr>
            <td><Typography>Фото</Typography></td>
            <td><Typography>Наименование</Typography></td>
            <td><Typography>Цена</Typography></td>
            <td><Typography>Единица измерения</Typography></td>
            <td><Typography>Комментарий</Typography></td>
            <td><Typography>В корзину</Typography></td>
            {admin && <td><Typography>Внутренний комментарий</Typography></td>}
          </tr>
        </thead>
        <tbody>
          {Object.entries(products).map(([category, products]) =>
            <React.Fragment key={category}>
              <tr className="category"><td colSpan={100}>
                <Typography variant="h5">
                  {category}
                </Typography>
              </td></tr>
              {products.map((p, i) => <Product
                key={p.id}
                model={p}
                darker={i % 2}
              />)}
            </React.Fragment>
          )}
        </tbody>
      </Table>
    </Root>
  )
}