import styled from 'styled-components'

import { auth, database, storage } from '../firebase'
import { CellImg } from './Table'
import { toCurrencyStringRu, useFirebaseValue, useLocalStorageState } from '../utils'

import Button from '@mui/material/Button'
import InfoIcon from '@mui/icons-material/Info'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'



import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
/*
const Accordion = 'details'
const AccordionSummary = 'summary'
const AccordionDetails = 'div'
*/



const Root = styled.div`
  padding: 1em;

  button {
    cursor: pointer;
    transition: 0.2s ease-in opacity;
  }

  button:hover {
    opacity: 0.8;
  }

  .category {
    color: #239F23;
    padding: 12px 0;
    font-size: 32px;
    font-weight: 600;
    flex: 1;
  }

  .product-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 24px;
    margin: 24px 0;
  }

  @media (min-width: 996px) {
    .product-list {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }

  .product {
    border-radius: 5px;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    box-shadow: 0 .125rem .25rem rgba(0,0,0,.075);
  }

  .product-section {
    margin-bottom: 24px;
  }

  .product-header {
    margin-bottom: auto;
  }

  .product-section-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-top: 8px;
  }

  .product-remove {
    position: absolute;
    top: 8px;
    right: 8px;
    background-color: #e74c3c;
    border: 0;
    border-radius: 3px;
    padding: 5px;
    color: white;
    cursor: pointer;
  }

  .product-image {
    height: 280px;
    overflow: hidden;
  }

  .product-body {
    display: flex;
    flex-direction: column;
    padding: 10px;
    flex-grow: 1;
  }

  .product-title {
    font-size: 20px;
    font-weight: 600;
    color: #2e2e38;
    margin-bottom: 8px;
    width: 100%;
  }

  .product-label {
    font-size: 14px;
    font-weight: 500;
    color: #8a8a8a; 
    margin-bottom: 6px;
  }

  .product-counter {
    display: grid;
    grid-template-columns: 32px 64px 32px;
    grid-template-rows: 32px;
    grid-gap: 4px;
  }

  .product-counter button {
    border: 0;
    border-radius: 3px;
    color: white;
    font-size: 24px;
    font-weight: 600;
    cursor: pointer;
  }

  .product-counter input {
    display: block;
    text-align: center;
    border: 2px #8a8a8a solid;
    border-radius: 4px;
  }

  .product-counter button:first-of-type {
    background-color: #e67e22;
  }

  .product-counter button:last-of-type {
    background-color: #60CE60;
  }

  .product-price {
    font-size: 24px;
    font-weight: 600;
    color: #239F23;
  }

  .product-unit-price {
    font-size: 16px;
    font-weight: 600;
    color: #aaa;
    margin-top: 4px;
  }

  .product-buy {
    background-color: #239F23;
    border: 0;
    cursor: pointer;
    text-transform: uppercase;
    color: white;
    font-size: 15px;
    padding: 20px;
  }
`

const GrayLabel = styled.div`
  background: gray;
  color: white;
  text-align: center;
  padding: 0.2em;
  margin: 0.2em 0;
`

const truncate = (str: string | undefined, n: number) => {
  if (!str) return ''
  return str.length <= n ? str : str.substring(0, n + 1) + '...'
}

const adminSelector = store => !!store.claims.admin

export const productSlug = model => model.id + '|' + hash(model.name + model.unit + model.price)

export const addToCart = (count, model, user = auth.currentUser) => {
  const slug = productSlug(model)
  const cartRef = database.ref(`carts/${user.uid}`)
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
}

const Product = props => {
  const [count, setCount, incCount, decCount] = useCounter(1, 1)
  const { model, edit, handleOpenCooperateModal, pickedSlots } = props

  const [isDetailsModalOpened, toggleDetailsModalOpened] = useToggle(false)
  const [isLoginModalOpened, toggleLoginModalOpened] = useToggle(false)

  const deleteProduct = useCallback(() => {
    if (!model.name || confirm(`Вы собираетесь удалить продукт "${model.name}", это действие невозможно отменить.\n\nВы уверены?`)) {
      if (model.image) storage.ref(model.image).delete().catch(() => { })
      database.ref(`products/${model.id}`).set(null).catch(() => { })
    }
  }, [model])

  const user = useUser()
  const onAddToCart = useCallback(() => {
    if (user)
      addToCart(count, model, user)
    else
      toggleLoginModalOpened()
  }, [count, model, user])

  const pasteFromTable = useCallback(() => {
    navigator.clipboard.readText().then(text => {
      const cells = text.split('\t')
      if (cells.length !== 36) {
        alert('Неправильный формат данных: в строке должно быть ровно 36 столбцов')
        return
      }
      const comment = cells[35] || null
      const name = cells[27]
      const price = +((cells[28] || '').replace(',', '.'))
      const unit = cells[23]
      if (!(cells && name && price && unit)) {
        alert('Неправильный формат данных: отсутствует цена, наименование или фасовка (число)')
        return
      }
      const weight = cells[22] === 'кг' ? (+((cells[21] || '').replace(',', '.')) || '') : null
      database.ref(`/products/${model.id}`).update({
        comment,
        name,
        price,
        unit,
        weight
      }).catch(() => { })
    })
  }, [model])

  const canBuy = !!model.price

  return (
    <article className="product" style={{ background: props.darker ? 'gray' : undefined, opacity: model.hidden ? 0.4 : 1 }}>
      <div className="product-image">
        <FirebaseImageUploader src={model.image} saveAs={`products/${model.id}`} databasePath={`/products/${model.id}/image`} component={CellImg} enabled={edit} />
      </div>
      <div className="product-body">
        {
          !edit &&
          <React.Fragment>
            <header className='product-header'>
              <p className='product-title'>{model.name}</p>
              {model.comment && <p>{model.comment}</p>}
            </header>
            <div className='product-section product-section-grid'>
              <div>
                <p className='product-label'>фасовка:</p>
                <p>{model.unit || '-'} {model.unitName}</p>
              </div>
              {(model.description || model.about) &&
                <div>
                  <Button onClick={toggleDetailsModalOpened}>
                    Подробнее
                  </Button>
                </div>
              }
            </div>
            <ProductDetailsModal isOpened={isDetailsModalOpened} onClose={toggleDetailsModalOpened} details={model} />
            <LoginRequestModal isOpened={isLoginModalOpened} onClose={toggleLoginModalOpened} />
            {model.slotCount && model.slotCount > 1 &&
              <Button onClick={handleOpenCooperateModal} endIcon={<InfoIcon />}>
                Продукт для кооперации
              </Button>
            }
            {model.slotCount && model.slotCount > 1 &&
              <Slots slots={model.slotCount} leftover={model.leftoverSlotCount} picked={pickedSlots} />
            }
            <footer className='product-section product-section-grid'>
              <div>
                <p className='product-price'>{model.price ? toCurrencyStringRu(model.price) : '-'}</p>
              </div>
              <div className='product-counter'>
                <button disabled={!canBuy} onClick={decCount}>-</button>
                <input disabled={!canBuy} size={11} style={{ display: 'block', textAlign: 'center' }} value={canBuy ? count : 'Нет в наличии'} readOnly />
                <button disabled={!canBuy} onClick={incCount}>+</button>
              </div>
            </footer>
          </React.Fragment>
        }{
          edit &&
          <React.Fragment>
            {<small style={{ textAlign: 'center', opacity: 0.4 }}>{model.id}</small>}
            <Button fullWidth onClick={pasteFromTable} variant="outlined" size="small" style={{ margin: '0.3em 0' }}>Вставить из таблицы</Button>
            <div className='product-section'>
              <p className='product-label'>название:</p>
              <FirebaseEditorField path={`/products/${model.id}/name`} value={model.name} enabled={edit} />
            </div>
            <div className='product-section'>
              <p className='product-label'>комментарий (будет снаружи карточки):</p>
              <FirebaseEditorField path={`/products/${model.id}/comment`} value={model.comment} enabled={edit} />
            </div>
            <div className='product-section'>
              <p className='product-label'>описание (будет внутри модалки):</p>
              <FirebaseEditorField path={`/products/${model.id}/description`} value={model.description} enabled={edit} />
            </div>
            <div className='product-section'>
              <p className='product-label'>внутренний комментарий (будет внутри модалки):</p>
              <FirebaseEditorField path={`/products/${model.id}/about`} value={model.about} enabled={edit} />
            </div>
            <div className='product-section'>
              <p className='product-label'>количество слотов для кооперации:</p>
              <FirebaseEditorField path={`/products/${model.id}/slotCount`} value={model.slotCount} enabled={edit} number />
            </div>
            <div className='product-section'>
              <p className='product-label'>остаток слотов для коопераци с прошлой закупки:</p>
              <FirebaseEditorField path={`/products/${model.id}/leftoverSlotCount`} value={model.leftoverSlotCount} enabled={edit} number />
            </div>
            <div className='product-section'>
              <p className='product-label'>
                ИТОГО по слотам:<br />
                {pickedSlots || 0} + {model.leftoverSlotCount || 0} / {model.slotCount || 0}<br />
                (выбрано) + (с прошлой) / (всего слотов)
              </p>
            </div>
            <div className='product-section'>
              <p className='product-label'>скрыть товар:</p>
              <FirebaseEditorCheckbox path={`/products/${model.id}/hidden`} value={model.hidden} enabled={edit} />
            </div>
            <div className='product-section'>
              <p className='product-label'>фасовка (число):</p>
              <FirebaseEditorField path={`/products/${model.id}/unit`} value={model.unit} enabled={edit} />
            </div>
            <div className='product-section'>
              <p className='product-label'>ед. измерения фасовки (кг / л / шт.):</p>
              <FirebaseEditorField path={`/products/${model.id}/unitName`} value={model.unitName} enabled={edit} />
            </div>
            <div className='product-section'>
              <p className='product-label'>вес (кг):</p>
              <FirebaseEditorField path={`/products/${model.id}/weight`} value={model.weight} enabled={edit} />
            </div>
            <div className='product-section'>
              <p className='product-label'>ссылка на отзыв:</p>
              <FirebaseEditorField path={`/products/${model.id}/link`} value={model.link} enabled={edit}>
                {link => link ? truncate(link, 20) : '-'}
              </FirebaseEditorField>
            </div>
            <div className='product-section'>
              <p className='product-label'>цена:</p>
              <FirebaseEditorField path={`/products/${model.id}/price`} value={model.price} enabled={edit} number />
            </div>
          </React.Fragment>
        }
      </div>
      {!edit && <button disabled={!canBuy} className='product-buy' onClick={onAddToCart}>В корзину</button>}
      {edit && <button className='product-remove' onClick={deleteProduct}>Удалить</button>}
    </article>
  )
}

import { hash, log, subscribe, useCounter, useSelector, useToggle } from '../utils'
import React, { useCallback, useEffect, useState } from 'react'
import FirebaseEditorField from './FirebaseEditorField'
import FirebaseEditorCheckbox from './FirebaseEditorCheckbox'
import FirebaseImageUploader from './FirebaseImageUploader'
import PageTitle from './PageTitle'
import EditorField from './EditorField'
import CurrentProcurement from './CurrentProcurement'
import ProductDetailsModal from './ProductDetailsModal'
import CooperateModal from './CooperateModal'
import { Slots } from './Slots'
import LoginRequestModal from './LoginRequestModal'
import { useUser } from './AuthShield'

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

export const stitchPickedSlotsInCarts = carts => {
  const pickedSlots = {}
  for (const items of Object.values(carts || {}))
    for (const item of Object.values(items))
      if (pickedSlots[item.product.id])
        pickedSlots[item.product.id] += item.count || 0
      else
        pickedSlots[item.product.id] = item.count || 0
  return pickedSlots
}

export const stitchPickedSlotsInOrders = (orders) => {
  if (!orders) return {}
  return Object.values(orders)
    .flatMap(item => Object.values(item))
    .flatMap(({ products }) => Object.values(products))
    .reduce((acc, { count, product } /** [{count, product}]*/) => {
      acc[product.id] = acc[product.id] ? acc[product.id] + count : count
      return acc
    }, {})
}

const addProduct = (category?) => event => {
  event.stopPropagation()
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
  const overwrite = (window as any).DATA_OVERWRITE
  console.warn(overwrite)
  if (!overwrite)
    return
  let products = []
  try {
    products = JSON.parse(overwrite)
  } catch (err) {
    console.warn(err)
    alert('Неправильный формат данных')
    return
  }
  if (!confirm(`Вы собираетесь перезаписать базу данных продуктов, это действие невозможно отменить.\n\nВы уверены?`))
    return

  database.ref('products').set(null)
    .then(() => Promise.all(products.map(product =>
      database.ref('products').push(product)
    )))
    .then(() => alert('Готово'))
}

export default () => {
  const admin = useSelector(adminSelector)
  const [edit, toggleEdit] = useToggle(false)
  const products = useFirebaseValue('products', [], categorize)
  const pickedSlotsInCarts = useFirebaseValue('carts', {}, stitchPickedSlotsInCarts)
  const pickedSlotsInOrders = useFirebaseValue('orders', {}, stitchPickedSlotsInOrders)
  const pickedSlots = Object.entries(pickedSlotsInOrders).reduce((acc, [id, count]) => {
    acc[id] = acc[id] ? acc[id] + count : count
    return acc
  }, pickedSlotsInCarts)

  const [isCooperateModalOpened, toggleCooperateModalOpened] = useToggle(false)


  const categoryList = (products) => Object.entries<any>(products).reduce((acc, [category, products]) => {
    if (products.some(({ hidden }) => hidden !== true) || edit) {
      acc.push([category, products])
    }
    return acc
  }, [])

  const productList = (products, edit) => products.reduce((acc, product) => {
    if (!product.hidden || edit) {
      acc.push(product)
    }
    return acc
  }, [])

  const [visibleCategories, setVisibleCategories] =
    useLocalStorageState('ProductList::visibleCategories', {})

  return (
    <Root>
      <PageTitle>
        Каталог
        {admin && (
          <button style={{ float: 'right' }} onClick={toggleEdit}>
            {edit ? '💾' : '✏️'}
          </button>
        )}
        {edit && (
          <button style={{ float: 'right' }} onClick={overwriteProducts}>
            🗃️
          </button>
        )}
        {edit && (
          <button style={{ float: 'right' }} onClick={addProduct()}>
            ➕
          </button>
        )}
      </PageTitle>
      <section>
        <CurrentProcurement edit={edit} />
      </section>
      <section>
        {categoryList(products).map(([category, items]) =>
          <Accordion
            key={category}
            expanded={!!visibleCategories[category]}
            onChange={(_, expanded) => setVisibleCategories(v => ({ ...v, [category]: expanded }))}
            TransitionProps={{ unmountOnExit: true, timeout: 200 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <div className='category'>
                <CategoryEditorField
                  category={category}
                  products={items}
                  enabled={edit}
                />
                {edit && (
                  <button
                    style={{ float: 'right' }}
                    onClick={addProduct(category)}
                  >
                    ➕
                  </button>
                )}
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className='product-list'>
                {productList(items, edit).map((item) =>
                  <Product
                    key={item.id}
                    model={item}
                    admin={admin}
                    edit={edit}
                    pickedSlots={pickedSlots[item.id]}
                    handleOpenCooperateModal={toggleCooperateModalOpened}
                  />
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        )}
      </section>
      <CooperateModal isOpened={isCooperateModalOpened} onClose={toggleCooperateModalOpened} />
    </Root>
  )
}
