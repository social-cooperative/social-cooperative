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

import { firebase, auth, database } from '../firebase'
import { Table, CellImg } from './Table'

const Root = styled.div`
  padding: 1em;
`

const adminSelector = store => !!store.claims.admin

const Product = props => {
  const { model } = props
  const [editing, toggleEditing] = useToggle(false)
  const admin = useSelector(adminSelector)
  const [count, setCount, incCount, decCount] = useCounter(1, 1)
  const deleteFromCart = () => database.ref(`/carts/${auth.currentUser.uid}/${model.id}`).set(null)

  return (
    <tr className="product" style={{ background: props.darker ? '#eeeeee' : undefined }}>
      <td className="image">
        <FirebaseImageUploader src={model.product.image} enabled={false} component={CellImg} />
      </td><td>
        <Typography variant="h6" title={model.product.comment}>
          {model.product.name}
        </Typography>
      </td><td>
        <Typography>
          {model.product.unit}
        </Typography>
      </td><td>
        <Typography>
          {model.product.price ? String(model.product.price).replace('.', ',') + 'р.' : '-'}
        </Typography>
      </td><td>
        <Typography>
          x{model.count}
        </Typography>
      </td><td>
        <Typography>
          {String(model.total).replace('.', ',') + 'р.'}
        </Typography>
      </td><td>
        <Typography>
          <button disabled={props.disabled} onClick={deleteFromCart}>Удалить</button>
        </Typography>
      </td>
    </tr>
  )
}


const ru = new Intl.NumberFormat("ru", { style: "currency", currency: "RUB" })

import { log, subscribe, useCounter, useSelector, useToggle } from '../utils'
import React, { useCallback, useEffect, useState } from 'react'
import FirebaseEditorField from './FirebaseEditorField'
import FirebaseImageUploader from './FirebaseImageUploader'
import { AnyRecord } from 'dns'

const categorize = products => products.reduce((acc, v) => ((acc[v.product.category] ? acc[v.product.category].push(v) : (acc[v.product.category] = [v])), acc), {}) as any

export default () => {
  const [products, setProducts] = useState({})
  useEffect(() => subscribe(
    database.ref(`carts/${auth.currentUser.uid}`),
    'value',
    snap => setProducts(snap.val() || {})
  ), [])

  return <Cart products={products} />

}


export const Cart = ({ products = {} }) => {
  const [categories, setCategories] = useState({})
  const [ordered, toggleOrdered] = useToggle(false)

  useEffect(() => {
    setCategories(categorize(Object.entries<any>(products).map(([k, v]) => (v.id = k, v))))
  }, [products])

  const total = Object.values<any>(products).reduce((acc, v) => acc += v.total, 0)

  const placeOrder = useCallback(() => {
    database.ref(`orders/${auth.currentUser.uid}`).push({
      products,
      date: firebase.database.ServerValue.TIMESTAMP,
      total,
      uid: auth.currentUser.uid,
      phone: auth.currentUser.phoneNumber,
    })
    database.ref(`carts/${auth.currentUser.uid}`).set(null)
  }, [products, total])

  return (
    <Root>
      <Typography variant="h4">Корзина</Typography>
      <Table>
        <thead>
          <tr>
            <td><Typography>Фото</Typography></td>
            <td><Typography>Наименование</Typography></td>
            <td><Typography>Единица измерения</Typography></td>
            <td><Typography>Цена</Typography></td>
            <td><Typography>Кол-во</Typography></td>
            <td><Typography>Стоимость</Typography></td>
            <td><Typography>Действия</Typography></td>
          </tr>
        </thead>
        <tbody>
          {Object.entries<any>(categories).map(([category, products]) =>
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
                disabled={ordered}
              />)}
            </React.Fragment>
          )}
          {!Object.entries(products).length
            ? <tr><td colSpan={100}>
              <Typography variant="h6" align="center">Ваша корзина пуста</Typography>
            </td></tr>
            : <>
              <tr className="category no-center">
                <td colSpan={100}>
                  <button onClick={placeOrder} style={{ padding: '1em', display: 'block', width: '100%' }} >
                    <Typography variant="h5">{ordered ? 'Отменить заказ' : 'Заказать на сумму ' + ru.format(total)}</Typography>
                  </button>
                </td>
              </tr>
            </>
          }
        </tbody>
      </Table>
    </Root>
  )
}