import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import styled from 'styled-components'

import QRModal from './QRModal'
import { firebase, auth, database } from '../firebase'
import { Table, CellImg } from './Table'
import { addToCart, productSlug } from './ProductList'
import { log, productsTotal, toCurrencyStringRu, toLocaleStringRu, useFirebaseValue, useInputState } from '../utils'

const Root = styled.div`
  padding: 1em;
`

const productChangedMessage = 'Информация об этом продукте была изменена, но за вами сохранено право приобрести то количество которое вы уже добавили в корзину.'

const Product = props => {
  const { model } = props
  const total = productsTotal(model)
  const slug = productSlug(model.product)
  const [frozen, setFrozen] = useState(false)
  const [alternatives, setAlternatives] = useState({})
  useEffect(() => {
    if (frozen)
      return subscribe(
        database.ref(`/products`)
          .orderByChild('name')
          .equalTo(model.product.name),
        'value', s => setAlternatives(s.val())
      )
    else setAlternatives({})
  }, [frozen])
  useEffect(() => {
    return subscribe(database.ref(`/products/${model.product.id}`), 'value', snap => {
      const product = snap.val()
      log(product)
      if (!product) {
        setFrozen(true)
        props?.onFrozen(model.product.name, true)
        return
      }
      product.id = model.product.id
      const currentSlug = productSlug(product)
      if (slug === currentSlug) {
        setFrozen(false)
        props?.onFrozen(model.product.name, false)
      }
      else {
        setFrozen(true)
        props?.onFrozen(model.product.name, true)
      }
    })
  }, [slug, props.onFrozen])
  const deleteFromCart = () => database.ref(`/carts/${auth.currentUser.uid}/${model.id}`).set(null)
  const replaceInCart = (productId, product) => () => deleteFromCart().then(() => addToCart(model.count, { ...product, id: productId }))
  const incCount = useCallback(() => database.ref(`/carts/${auth.currentUser.uid}/${model.id}`).update({
    count: model.count + 1,
  }), [model])
  const decCount = useCallback(() => database.ref(`/carts/${auth.currentUser.uid}/${model.id}`).update({
    count: Math.max(model.count - 1, 1),
  }), [model])

  return <>
    <tr id={model.product.name} className="product" style={{
      background: props.darker ? '#E7F7EB' : undefined,
      fontStyle: frozen ? 'italic' : undefined,
    }}>
      <td className="image">
        <FirebaseImageUploader src={model.product.image} enabled={false} component={CellImg} />
      </td><td>
        <Typography variant="h6" title={model.product.comment}>
          {model.product.name}{frozen && ' *'}
        </Typography>
      </td><td>
        <Typography>
          {model.product.unit}
        </Typography>
      </td><td>
        <Typography>
          {model.product.price ? toCurrencyStringRu(model.product.price) : '-'}
        </Typography>
      </td><td>
        <Typography>
          x{model.count}
        </Typography>
      </td><td>
        <Typography>
          {toCurrencyStringRu(total)}
        </Typography>
      </td><td>
        <Typography component="div" style={{ display: 'flex', float: 'right' }}>
          <button style={{ width: 25 }} onClick={incCount} disabled={frozen}>+</button>
          <button style={{ width: 25 }} onClick={decCount} disabled={frozen || model.count <= 1}>-</button>
          <button onClick={deleteFromCart}>Удалить</button>
        </Typography>
      </td>
    </tr>
    {frozen && <>
      <tr className="product" style={{ background: props.darker ? '#E7F7EB' : undefined }}>
        <td></td>
        <td colSpan={6}>Этого продукта больше нет, вы можете удалить или заменить его перед заказом</td>
      </tr>
      {Object.entries<any>(alternatives).map(([key, product]) =>
        <tr className="product" key={key} style={{ background: props.darker ? '#E7F7EB' : undefined }}>
          <td></td>
          <td>{product.name}</td>
          <td>{product.unit}</td>
          <td>{toCurrencyStringRu(product.price)}</td>
          <td>x{model.count}</td>
          <td>{toCurrencyStringRu(product.price * model.count)}</td>
          <td><button style={{ float: 'right' }} onClick={replaceInCart(key, product)}>Заменить</button></td>
        </tr>
      )}
    </>}
  </>
}

const ru = new Intl.NumberFormat("ru", { style: "currency", currency: "RUB" })

import { subscribe } from '../utils'
import React, { useCallback, useEffect, useState } from 'react'
import FirebaseImageUploader from './FirebaseImageUploader'
import PageTitle from './PageTitle'
import CurrentProcurement from './CurrentProcurement'

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

  const [name, setName, setNameRaw] = useInputState()
  const [address, setAddress, setAddressRaw] = useInputState()
  const [comment, setComment] = useInputState()

  const [payDetails, setPayDetails] = useState({ phone: '', timestamp: '', total: '' })
  const [isQRModalOpened, setIsQRModalOpened] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState(undefined as any)
  const [frozenProducts, setFrozenProducts] = useState({})
  const frozenProductsList = Object.entries<any>(frozenProducts).filter(([name, frozen]) => frozen).map(([name]) => name)
  const onFrozen = useCallback((name, truth) => {
    setFrozenProducts(fp => ({ ...fp, [name]: truth }))
  }, [setFrozenProducts])

  const openModal = () => { setIsQRModalOpened(true) }
  const closeModal = () => { setIsQRModalOpened(false) }

  useEffect(() => subscribe(database.ref(`users/${auth.currentUser.uid}`), 'value', snap => {
    const user = snap.val()
    setNameRaw(user?.name || '')
    setAddressRaw(user?.address || '')
  }), [])

  useEffect(() => {
    setCategories(categorize(Object.entries<any>(products).map(([k, v]) => (v.id = k, v))))
  }, [products])

  const productCount = Object.entries(products).length

  const total = productsTotal(products)

  const {
    startDate = 0,
    endDate = 0,
    minCartTotal = 0
  } = useFirebaseValue('/currentProcurement', {})
  const cartTotalValid = total >= minCartTotal
  const now = Date.now()
  const activeNow = now > startDate && now < endDate

  const placeOrder = useCallback(() => {
    const phone = auth.currentUser.phoneNumber
    database.ref(`users/${auth.currentUser.uid}`).update({
      name,
      address,
    })
    database.ref(`orders/${auth.currentUser.uid}`).push({
      products,
      date: firebase.database.ServerValue.TIMESTAMP,
      uid: auth.currentUser.uid,
      phone,
      name,
      address,
      comment,
    }).then(snap =>
      database.ref(`orders/${auth.currentUser.uid}/${snap.key}/date`).get()
    ).then(snap => {
      console.log()
      database.ref(`carts/${auth.currentUser.uid}`).set(null)
      const date = snap.val()
      const timestamp = toLocaleStringRu(date)
      setPlacedOrderId(date)
      setPayDetails({ timestamp, phone, total })
      openModal()
    })
  }, [products, name, address, comment])

  return (
    <Root>
      <PageTitle>Корзина</PageTitle>
      <QRModal isOpened={isQRModalOpened} id={placedOrderId} onClose={closeModal} first details={payDetails} />
      <Table>
        <thead>
          <tr>
            <td><Typography>Фото</Typography></td>
            <td><Typography>Наименование</Typography></td>
            <td><Typography>Ед. изм.</Typography></td>
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
                onFrozen={onFrozen}
                model={p}
                darker={i % 2}
              />)}
            </React.Fragment>
          )}

          {!productCount
            ? <tr><td colSpan={100}>
              <Typography variant="h6" align="center">Ваша корзина пуста</Typography>
              <Typography align="center"><a href="/orders">К заказам</a></Typography>
            </td></tr>
            : <>
              <tr className="category no-center">
                <td colSpan={100}>
                  <Typography variant="h5" component="div">
                    <div style={{ display: 'flex', marginBottom: '0.5em' }}>
                      <input placeholder="Ф.И.О." value={name} onChange={setName} style={{ flex: 1, marginRight: '0.5em' }} />
                      <input placeholder="Адрес" value={address} onChange={setAddress} style={{ flex: 1 }} />
                    </div>
                    <div style={{ display: 'flex', marginBottom: '0.5em' }}>
                      <input placeholder="Комментарий к заказу" value={comment} onChange={setComment} style={{ flex: 1 }} />
                    </div>
                    {/*!cartTotalValid &&
                      <React.Fragment>
                        <Typography style={{ marginTop: '8px', fontWeight: 600 }}>
                          К сожалению, возможность сделать заказ на сумму меньше {minCartTotal} ₽ рублей временно недоступна.
                        </Typography>
                        <Typography style={{ marginTop: '8px', marginBottom: '8px' }}>
                          Вы можете либо увеличить сумму заказа, либо скооперироваться с другими людьми и объединить ваши заказы для набора нужной суммы.
                        </Typography>
                      </React.Fragment>
                    */}
                    <CurrentProcurement />
                    {activeNow && !!frozenProductsList.length &&
                      <Typography style={{ marginBottom: '1em' }} align="center">
                        В вашей корзине есть устаревшие продукты, замените или удалите следующие позиции:<br />
                        {frozenProductsList.map(name => <div key={name}><a href={'#' + name}>{name}</a></div>)}
                      </Typography>
                    }
                    <button disabled={!(name && address && cartTotalValid && activeNow && !frozenProductsList.length)} onClick={placeOrder} style={{ padding: '1em', display: 'block', width: '100%' }} >
                      Заказать на сумму {toCurrencyStringRu(total)}
                    </button>
                    <Typography style={{ marginTop: '1em' }}>
                      * Если вы покупаете у нас в первый раз, вам понадобится подписать заявление на вступление в наш кооператив и согласие на обработку персональных данных в соответствие закона 152-ФЗ. Эти документы привезёт курьер при первой доставке. Не забудьте паспорт
                    </Typography>
                  </Typography>
                </td>
              </tr>
            </>
          }
        </tbody>
      </Table>
    </Root>
  )
}