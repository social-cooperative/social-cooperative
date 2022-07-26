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
import { productSlug } from './ProductList'
import { productsTotal, subscribeOnce } from '../utils'

const Root = styled.div`
  padding: 1em;
`

const productChangedMessage = 'Информация об этом продукте была изменена, но за вами сохранено право приобрести то количество которое вы уже добавили в корзину.'

const Product = props => {
  const { model } = props
  const total = productsTotal(model)
  const slug = productSlug(model.product)
  const [frozen, setFrozen] = useState(false)
  useEffect(() => {
    setFrozen(true)
    return subscribe(database.ref(`/products/${model.product.id}`), 'value', snap => {
      const product = snap.val()
      if (!product) return
      product.id = model.product.id
      const currentSlug = productSlug(product)
      if (slug === currentSlug) setFrozen(false)
      else setFrozen(true)
    })
  }, [slug])
  const deleteFromCart = () => database.ref(`/carts/${auth.currentUser.uid}/${model.id}`).set(null)
  const incCount = useCallback(() => database.ref(`/carts/${auth.currentUser.uid}/${model.id}`).update({
    count: model.count + 1,
  }), [model])
  const decCount = useCallback(() => database.ref(`/carts/${auth.currentUser.uid}/${model.id}`).update({
    count: Math.max(model.count - 1, 1),
  }), [model])

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
          {String(total).replace('.', ',') + 'р.'}
        </Typography>
      </td><td>
        <Typography component="div" style={{ display: 'flex' }}>
          <button style={{ width: 25 }} onClick={incCount} disabled={frozen}>+</button>
          <button style={{ width: 25 }} onClick={decCount} disabled={frozen || model.count <= 1}>-</button>
          <button disabled={props.disabled} onClick={deleteFromCart}>Удалить</button>
        </Typography>
        {frozen && <div style={{ width: 128, textAlign: 'justify' }}>{productChangedMessage}</div>}
      </td>
    </tr>
  )
}


const ru = new Intl.NumberFormat("ru", { style: "currency", currency: "RUB" })

import { log, once, subscribe, useCounter, useSelector, useToggle } from '../utils'
import React, { useCallback, useEffect, useState } from 'react'
import FirebaseEditorField from './FirebaseEditorField'
import FirebaseImageUploader from './FirebaseImageUploader'
import { AnyRecord } from 'dns'
import products from '../products'

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

  const total = productsTotal(products)

  const placeOrder = useCallback(() => {
    database.ref(`orders/${auth.currentUser.uid}`).push({
      products,
      date: firebase.database.ServerValue.TIMESTAMP,
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