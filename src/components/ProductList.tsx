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

import { auth, database, storage } from '../firebase'
import { Table, CellImg } from './Table'

const Root = styled.div`
  padding: 1em;
`

const truncate = (str, n) => str.length <= n ? str : str.substring(0, n + 1) + '...'

const adminSelector = store => !!store.claims.admin

export const productSlug = model => model.id + '|' + hash(model.name + model.unit + model.price)

const Product = props => {
  const [count, setCount, incCount, decCount] = useCounter(1, 1)
  const { model, edit, admin } = props

  const deleteProduct = useCallback(() => {
    if (!model.name || confirm(`Вы собираетесь удалить продукт "${model.name}", это действие невозможно отменить.\n\nВы уверены?`)) {
      if (model.image) storage.ref(model.image).delete().catch(() => { })
      database.ref(`products/${model.id}`).set(null).catch(() => { })
    }
  }, [model])

  const addToBasket = useCallback(() => {
    const slug = productSlug(model)

    const cartRef = database.ref(`carts/${auth.currentUser.uid}`)

    cartRef.child(slug).get().then(snap => {
      const inCart = snap.val()
      if (inCart) {
        inCart.count += count
        cartRef.child(slug).set(inCart)
      } else {
        cartRef.child(slug).set({
          product: model,
          count: count,
        })
      }
    })
  }, [count, model])

  const canBuy = !!model.price

  return (
    <tr className="product" style={{ background: props.darker ? '#E7F7EB' : undefined }}>
      <td className="image">
        <FirebaseImageUploader src={model.image} saveAs={`products/${model.id}`} databasePath={`/products/${model.id}/image`} component={CellImg} enabled={edit} />
      </td><td>
        <Typography variant="h6">
          <FirebaseEditorField path={`/products/${model.id}/name`} value={model.name} enabled={edit} />
        </Typography>
      </td><td>
        <Typography variant="h6">
          <FirebaseEditorField path={`/products/${model.id}/price`} value={model.price} enabled={edit} number>
            {price => price ? String(price).replace('.', ',') + 'р.' : '-'}
          </FirebaseEditorField>
        </Typography>
      </td><td>
        <Typography variant="h6">
          <FirebaseEditorField path={`/products/${model.id}/unit`} value={model.unit} enabled={edit} />
        </Typography>
      </td><td>
        <Typography>
          <FirebaseEditorField path={`/products/${model.id}/comment`} value={model.comment} enabled={edit} />
        </Typography>
        {edit ? (
          <Typography>
            <FirebaseEditorField path={`/products/${model.id}/link`} value={model.link} enabled={edit}>
              {v => truncate(v, 20)}
            </FirebaseEditorField>
          </Typography>
        ) : (model.link &&
          <Typography>
            <a href={model.link}>Подробнее</a>
          </Typography>
        )
        }
      </td>{admin && <td>
        <Typography>
          <FirebaseEditorField path={`/products/${model.id}/commentInternal`} value={model.commentInternal} enabled={edit} />
        </Typography>
      </td>}{!edit && <td>
        <input disabled={!canBuy} size={11} style={{ display: 'block', textAlign: 'center' }} value={canBuy ? count : 'Нет в наличии'} readOnly />
        <div style={{ display: 'flex' }}>
          <button disabled={!canBuy} style={{ width: 25 }} onClick={incCount}>+</button>
          <button disabled={!canBuy} style={{ width: 25 }} onClick={decCount}>-</button>
          <button disabled={!canBuy} style={{ flex: 1 }} onClick={addToBasket}><small>В корзину</small></button>
        </div>
      </td>}{edit && <td>
        <button onClick={deleteProduct}>🗑️</button>
      </td>}
    </tr>
  )
}

import products from '../products'
import { hash, log, subscribe, useCounter, useSelector, useToggle } from '../utils'
import React, { useCallback, useEffect, useState } from 'react'
import FirebaseEditorField from './FirebaseEditorField'
import FirebaseImageUploader from './FirebaseImageUploader'
import PageTitle from './PageTitle'
import EditorField from './EditorField'

const CategoryEditorField = ({ category, products, ...rest }) => {
  const save = useCallback(name => {
    for (const product of products)
      database.ref(`/products/${product.id}/category`).set(name).catch(() => { })
  }, [category, products])
  return <EditorField {...rest} value={category} onSave={save} immediate={false} />
}

export const categorize = products => {
  products = Object.entries<any>(products).map(([k, v]) => (v.id = k, v))
  const categories = products.reduce((acc, v) => ((acc[v.category] ? acc[v.category].push(v) : (acc[v.category] = [v])), acc), {}) as any
  for (const k in categories)
    categories[k] = categories[k].sort((a, b) => a.name > b.name ? 1 : -1)
  return Object.fromEntries(Object.entries(categories).sort((a, b) => a[0] > b[0] ? 1 : -1)) as any
}

const addProduct = (category?) => () => {
  if (!category) {
    category = prompt('Введите категорию продукта')
    if (!category) return
  }
  database.ref('products').push({ category })
}

const overwriteProducts = () => {
  if (!confirm(`Вы собираетесь перезаписать базу данных продуктов, это действие невозможно отменить.\n\nВы уверены?`))
    return
  alert('Вставьте данные для перезаписи в переменную window.DATA_OVERWRITE')
  const overwrite = window.DATA_OVERWRITE
  console.log(overwrite)
  if (!overwrite)
    return
  let products = []
  try {
    products = JSON.parse(overwrite)
  } catch (err) {
    console.log(err)
    alert('Неправильный формат данных')
    return
  }
  if (!confirm(`Вы собираетесь перезаписать базу данных продуктов, это действие невозможно отменить.\n\nВы уверены?`))
    return

  database.ref('products').set(null)
    .then(() => Promise.all(products.map(product =>
      database.ref('products').push(product)
    )))
    .then(() => alert('Говто'))
}

export default () => {
  const admin = useSelector(adminSelector)
  const [edit, toggleEdit] = useToggle(false)
  const [products, setProducts] = useState([])
  useEffect(() => subscribe(database.ref('products'), 'value', snap => setProducts(categorize(snap.val()))), [])

  return (
    <Root>
      <PageTitle>
        Каталог
        {admin && <button style={{ float: 'right' }} onClick={toggleEdit}>{edit ? '💾' : '✏️'}</button>}
        {edit && <button style={{ float: 'right' }} onClick={overwriteProducts}>🗃️</button>}
        {edit && <button style={{ float: 'right' }} onClick={addProduct()}>➕</button>}
      </PageTitle>
      <Table>
        <thead>
          <tr>
            <td><Typography>Фото</Typography></td>
            <td><Typography>Наименование</Typography></td>
            <td><Typography>Цена</Typography></td>
            <td><Typography>Ед. изм.</Typography></td>
            <td><Typography>Комментарий</Typography></td>
            {admin && <td><Typography>Внутренний комментарий</Typography></td>}
            {!edit && <td><Typography>В корзину</Typography></td>}
            {edit && <td></td>}
          </tr>
        </thead>
        <tbody>
          {Object.entries(products).map(([category, products]) =>
            <React.Fragment key={category}>
              <tr className="category"><td colSpan={100}>
                <Typography variant="h5">
                  <CategoryEditorField category={category} products={products} enabled={edit} />
                  {edit && <button style={{ float: 'right' }} onClick={addProduct(category)}>➕</button>}
                </Typography>
              </td></tr>
              {products.map((p, i) => <Product
                key={p.id}
                model={p}
                darker={i % 2}
                admin={admin}
                edit={edit}
              />)}
            </React.Fragment>
          )}
        </tbody>
      </Table>
    </Root>
  )
}