import Typography from '@mui/material/Typography'
import MaterialButton from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import styled from 'styled-components'

import QRModal from './QRModal'
import { firebase, auth, database } from '../firebase'
import { Table, CellImg } from './Table'
import { addToCart, productSlug } from './ProductList'
import {
  productsTotal,
  toCurrencyStringRu,
  toLocaleStringRu,
  useFirebaseValue,
  useInputState,
  useSelector,
} from '../utils'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

const Root = styled.div`
  padding: 1em;
`

const Product = (props) => {
  const { model } = props
  const total = productsTotal(model)
  const slug = productSlug(model.product)
  const [frozen, setFrozen] = useState(false)
  const [alternatives, setAlternatives] = useState({})
  useEffect(() => {
    if (frozen)
      return subscribe(
        database
          .ref(`/products`)
          .orderByChild('name')
          .equalTo(model.product.name),
        'value',
        (s) => setAlternatives(s.val())
      )
    else setAlternatives({})
  }, [frozen])
  useEffect(() => {
    return subscribe(
      database.ref(`/products/${model.product.id}`),
      'value',
      (snap) => {
        const product = snap.val()
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
        } else {
          setFrozen(true)
          props?.onFrozen(model.product.name, true)
        }
      }
    )
  }, [slug, props.onFrozen])
  const deleteFromCart = () =>
    database.ref(`/carts/${auth.currentUser.uid}/${model.id}`).set(null)
  const replaceInCart = (productId, product) => () =>
    deleteFromCart().then(() =>
      addToCart(model.count, { ...product, id: productId })
    )
  const incCount = useCallback(
    () =>
      database.ref(`/carts/${auth.currentUser.uid}/${model.id}`).update({
        count: model.count + 1,
      }),
    [model]
  )
  const decCount = useCallback(
    () =>
      database.ref(`/carts/${auth.currentUser.uid}/${model.id}`).update({
        count: Math.max(model.count - 1, 1),
      }),
    [model]
  )

  return (
    <>
      <tr
        id={model.product.name}
        className='product'
        style={{
          background: props.darker ? '#E7F7EB' : undefined,
          fontStyle: frozen ? 'italic' : undefined,
        }}
      >
        <td className='image'>
          <FirebaseImageUploader
            src={model.product.image}
            enabled={false}
            component={CellImg}
          />
        </td>
        <td>
          <Typography title={model.product.comment}>
            <b>
              {model.product.name}
              {frozen && ' *'}
            </b>
          </Typography>
        </td>
        <td>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: 'small' }}>
            <FirebaseEditorCheckbox
              path={`/carts/${auth.currentUser.uid}/${model.id}/forChange`}
              value={model.forChange}
              enabled={true}
              size="small"
            />
            <div>Предлагать аналоги</div>
          </label>
        </td>
        <td style={{ width: '70px' }}>
          <Typography>
            {model.product.price
              ? toCurrencyStringRu(model.product.price)
              : '-'}
          </Typography>
        </td>
        <td style={{ width: '60px' }}>
          <Typography>x{model.count}</Typography>
        </td>
        <td style={{ width: '80px' }}>
          <Typography>{toCurrencyStringRu(total)}</Typography>
        </td>
        <td style={{ display: 'flex' }}>
          <IconButton color='primary' onClick={incCount} disabled={frozen}>
            <AddIcon />
          </IconButton>
          <IconButton
            color='warning'
            onClick={decCount}
            disabled={frozen || model.count <= 1}
          >
            <RemoveIcon />
          </IconButton>
          <IconButton color='error' onClick={deleteFromCart}>
            <DeleteIcon />
          </IconButton>
        </td>
      </tr>
      {frozen && (
        <>
          <tr
            className='product'
            style={{ background: props.darker ? '#E7F7EB' : undefined }}
          >
            <td></td>
            <td colSpan={6}>
              Этого продукта больше нет, вы можете удалить или заменить его
              перед заказом
            </td>
          </tr>
          {alternatives &&
            Object.entries<any>(alternatives).map(([key, product]) => (
              <tr
                className='product'
                key={key}
                style={{ background: props.darker ? '#E7F7EB' : undefined }}
              >
                <td></td>
                <td>{product.name}</td>
                <td>{product.unit}</td>
                <td>{toCurrencyStringRu(product.price)}</td>
                <td>x{model.count}</td>
                <td>{toCurrencyStringRu(product.price * model.count)}</td>
                <td>
                  <button
                    style={{ float: 'right' }}
                    onClick={replaceInCart(key, product)}
                  >
                    Заменить
                  </button>
                </td>
              </tr>
            ))}
        </>
      )}
    </>
  )
}

const ru = new Intl.NumberFormat('ru', { style: 'currency', currency: 'RUB' })

import { subscribe } from '../utils'
import React, { useCallback, useEffect, useState } from 'react'
import FirebaseImageUploader from './FirebaseImageUploader'
import PageTitle from './PageTitle'
import CurrentProcurement from './CurrentProcurement'
import { FormControlLabel, IconButton, Radio, RadioGroup } from '@mui/material'
import FirebaseEditorCheckbox from './FirebaseEditorCheckbox'
import AuthShield from './AuthShield'

const categorize = (products) =>
  products.reduce(
    (acc, v) => (
      acc[v.product.category]
        ? acc[v.product.category].push(v)
        : (acc[v.product.category] = [v]),
      acc
    ),
    {}
  ) as any

const CartContainer = () => {
  const [products, setProducts] = useState({})
  useEffect(() => {
    return subscribe(
      database.ref(`carts/${auth.currentUser.uid}`),
      'value',
      (snap) => setProducts(snap.val() || {})
    )
  }, [])
  return <Cart products={products} />
}

export default () => (
  <AuthShield>
    <CartContainer />
  </AuthShield>
)

const adminSelector = store => !!store.claims.admin;

const ValidationTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} componentsProps={{ tooltip: { className: className } }} />
))({fontSize: '18px', fontWeight: '300', maxWidth: 500});

export const Cart = ({ products = {} }) => {
  const [categories, setCategories] = useState({})

  const [name, setName, setNameRaw] = useInputState()
  const [address, setAddress, setAddressRaw] = useInputState()
  const [comment, setComment] = useInputState()

  const [isRemoveIfNotCalled, setIsRemoveIfNotCalled] = useState(null)

  const wantToChange = Object.values(products).some(
    (model: any) => model.forChange
  )
  
  const isAdmin = useSelector(adminSelector);

  const getValidatonMessage = (): string | null => {
    if (isAdmin && cartTotalValid) {
      return null;
    }

    if (!activeNow) {
      return `
        Невозможно сделать заказ, так как закупка неактивна. 
        Даты ближайшей закупки указаны чуть выше.
      `
    }

    if (frozenProductsList.length) {
      return `
        В вашей корзине есть устаревшие продукты. Пожалуйста, замените или удалите их.
      `
    }

    if (!cartTotalValid) {
      return `
        Не набрана минимальная сумма заказа: ${toCurrencyStringRu(minCartTotal)}.
      `
    }

    if (!name || !address) {
      return `
        Не заполнены обязательные поля — ФИО и/или адрес.
      `
    }

    if (wantToChange && isRemoveIfNotCalled === null) {
      return `
        Не указана информация о том, что делать с товарами, если мы вам не дозвонимся.
      `
    }

    return null;
  }

  const handleChangeRemoveIfNotCalledOption = ({ target }) => {
    const value = target.value === 'false' ? false : true
    setIsRemoveIfNotCalled(value)
    changeOptionInDB(value)
  }

  const [payDetails, setPayDetails] = useState({
    phone: '',
    timestamp: '',
    total: '',
  })
  const [isQRModalOpened, setIsQRModalOpened] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState(undefined as any)
  const [frozenProducts, setFrozenProducts] = useState({})
  const frozenProductsList = Object.entries<any>(frozenProducts)
    .filter(([name, frozen]) => frozen)
    .map(([name]) => name)
  const onFrozen = useCallback(
    (name, truth) => {
      setFrozenProducts((fp) => ({ ...fp, [name]: truth }))
    },
    [setFrozenProducts]
  )

  const openModal = () => {
    setIsQRModalOpened(true)
  }
  const closeModal = () => {
    setIsQRModalOpened(false)
  }

  useEffect(
    () =>
      subscribe(
        database.ref(`users/${auth.currentUser.uid}`),
        'value',
        (snap) => {
          const user = snap.val()
          setNameRaw(user?.name || '')
          setAddressRaw(user?.address || '')
          setIsRemoveIfNotCalled(user?.isRemoveIfNotCalled ?? null)
        }
      ),
    []
  )

  useEffect(() => {
    setCategories(
      categorize(Object.entries<any>(products).map(([k, v]) => ((v.id = k), v)))
    )
  }, [products])

  const productCount = Object.entries(products).length

  const total = productsTotal(products)

  const {
    startDate = 0,
    endDate = 0,
    minCartTotal = 0,
  } = useFirebaseValue('/currentProcurement', {})
  const cartTotalValid = total >= minCartTotal
  const now = Date.now()
  const activeNow = now > startDate && now < endDate

  const changeOrderDetailsInDB = useCallback(() => {
    database.ref(`users/${auth.currentUser.uid}`).update({
      name,
      address,
      isRemoveIfNotCalled,
    })
  }, [name, address, isRemoveIfNotCalled])

  const changeOptionInDB = useCallback(
    (isRemoveIfNotCalled) => {
      database.ref(`users/${auth.currentUser.uid}`).update({
        isRemoveIfNotCalled,
      })
    },
    [isRemoveIfNotCalled]
  )

  const placeOrder = useCallback(() => {
    const phone = auth.currentUser.phoneNumber
    database
      .ref(`orders/${auth.currentUser.uid}`)
      .push({
        products,
        date: firebase.database.ServerValue.TIMESTAMP,
        uid: auth.currentUser.uid,
        phone,
        name,
        wantToChange,
        isRemoveIfNotCalled,
        address,
        comment,
      })
      .then((snap) =>
        database.ref(`orders/${auth.currentUser.uid}/${snap.key}/date`).get()
      )
      .then((snap) => {
        database.ref(`carts/${auth.currentUser.uid}`).set(null)
        const date = snap.val()
        const timestamp = toLocaleStringRu(date)
        setPlacedOrderId(date)
        setPayDetails({ timestamp, phone, total })
        openModal()
      })
  }, [products, name, address, comment, isRemoveIfNotCalled])

  return (
    <Root>
      <PageTitle>Корзина</PageTitle>
      <QRModal
        isOpened={isQRModalOpened}
        id={placedOrderId}
        onClose={closeModal}
        first
        details={payDetails}
      />
      <Table>
        <tbody>
          {Object.entries<any>(categories).map(([category, products]) => (
            <React.Fragment key={category}>
              <tr className='category'>
                <td colSpan={100}>
                  <Typography className='category-heading'>
                    {' '}
                    {category}{' '}
                  </Typography>
                </td>
              </tr>
              {products.map((p, i) => (
                <Product
                  key={p.id}
                  onFrozen={onFrozen}
                  model={p}
                  darker={i % 2}
                />
              ))}
            </React.Fragment>
          ))}

          {!productCount ? (
            <tr>
              <td colSpan={100}>
                <Typography variant='h6' align='center'>
                  Ваша корзина пуста
                </Typography>
                <Typography align='center'>
                  <a href='/orders'>К заказам</a>
                </Typography>
              </td>
            </tr>
          ) : (
            <>
              <tr className='category no-center'>
                <td colSpan={100}>
                  <Typography variant='h5' component='div'>
                    <div style={{ display: 'flex', marginBottom: '0.5em' }}>
                      <input
                        placeholder='Ф.И.О.'
                        value={name}
                        onChange={setName}
                        style={{ flex: 1, marginRight: '0.5em' }}
                        onBlur={changeOrderDetailsInDB}
                      />
                      <input
                        placeholder='Адрес'
                        value={address}
                        onChange={setAddress}
                        style={{ flex: 1 }}
                        onBlur={changeOrderDetailsInDB}
                      />
                    </div>
                    <div style={{ display: 'flex', marginBottom: '0.5em' }}>
                      <input
                        placeholder='Комментарий'
                        value={comment}
                        onChange={setComment}
                        style={{ flex: 1 }}
                      />
                    </div>
                    {wantToChange && (
                      <div style={{ marginBottom: '24px' }}>
                        <Typography
                          variant='h6'
                          style={{ marginBottom: '12px' }}
                        >
                          Как поступить, если мы не дозвонились вам для замены?
                        </Typography>
                        <RadioGroup
                          name='radio-buttons-group'
                          value={isRemoveIfNotCalled}
                          onChange={handleChangeRemoveIfNotCalledOption}
                        >
                          <FormControlLabel
                            value={true}
                            control={<Radio />}
                            label='Убрать из корзины'
                          />
                          <FormControlLabel
                            value={false}
                            control={<Radio />}
                            label='Произвести замену'
                          />
                        </RadioGroup>
                      </div>
                    )}
                    <CurrentProcurement />
                    {activeNow && !!frozenProductsList.length && (
                      <Typography
                        style={{ marginBottom: '1em' }}
                        align='center'
                      >
                        В вашей корзине есть устаревшие продукты, замените или
                        удалите следующие позиции:
                        <br />
                        {frozenProductsList.map((name) => (
                          <div key={name}>
                            <a href={'#' + name}>{name}</a>
                          </div>
                        ))}
                      </Typography>
                    )}
                    <ValidationTooltip 
                      title={getValidatonMessage()} 
                      arrow
                      placement="top"
                    >
                      <span>
                        <MaterialButton
                          disabled={!!getValidatonMessage()}
                          variant="contained"
                          onClick={placeOrder}
                          style={{
                            padding: '1em',
                            display: 'block',
                            fontSize: '22px',
                            width: '100%',
                          }}
                        >
                          Внести пай на сумму {toCurrencyStringRu(total)}
                        </MaterialButton>
                      </span>
                    </ValidationTooltip>
                    <Typography style={{ marginTop: '1em' }}>
                      * Если вы покупаете у нас в первый раз, вам понадобится
                      подписать заявление на вступление в наш кооператив и
                      согласие на обработку персональных данных в соответствие
                      закона 152-ФЗ. Эти документы привезёт курьер при первой
                      доставке. Не забудьте паспорт
                    </Typography>
                  </Typography>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </Table>
    </Root>
  )
}
