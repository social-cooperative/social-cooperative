import styled from 'styled-components'

import { auth, database, storage } from '../firebase'
import { CellImg } from './Table'

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
    text-align: center;
    background-color: rgba(231,247,235,0.8);
    color: #095909;
    padding: 12px 0;
    font-size: 32px;
    font-weight: 600; 
  }

  .product-list {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 24px;
    margin: 24px 0;
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
    background-color: #A2DE7A;
  }

  .product-price {
    font-size: 24px;
    font-weight: 600;
    color: #095909;
  }

  .product-buy {
    background-color: #095909;
    border: 0;
    cursor: pointer;
    text-transform: uppercase;
    color: white;
    font-size: 15px;
    padding: 20px;
  }
`

const truncate = (str: string | undefined, n: number) => {
  if (!str) return '';
  return str.length <= n ? str : str.substring(0, n + 1) + '...'
}

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
    <article className="product" style={{ background: props.darker ? '#E7F7EB' : undefined }}>
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
              <p>{model.unit || '-'}</p>
            </div>
            {model.link && 
              <div>
                <p className='product-label'>ссылка на отзыв:</p>
                <a href={model.link}>Подробнее</a>
              </div>
            }
          </div>
          <footer className='product-section product-section-grid'>
            <p className='product-price'>{model.price ? String(model.price).replace('.', ',') + ' ₽' : '-'}</p>
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
          <div className='product-section'>
            <p className='product-label'>название:</p>
            <FirebaseEditorField path={`/products/${model.id}/name`} value={model.name} enabled={edit} />
          </div>
          <div className='product-section'>
            <p className='product-label'>комментарий / описание:</p>
            <FirebaseEditorField path={`/products/${model.id}/comment`} value={model.comment} enabled={edit} />
          </div>
          <div className='product-section'>
            <p className='product-label'>фасовка:</p>
            <FirebaseEditorField path={`/products/${model.id}/unit`} value={model.unit} enabled={edit} />
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
      {!edit && <button disabled={!canBuy} className='product-buy' onClick={addToBasket}>В корзину</button>}
      {edit && <button className='product-remove' onClick={deleteProduct}>Удалить товар</button>}
    </article>
  )
}

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
    .then(() => alert('Готово'))
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
      <section>
        {Object.entries(products).map(([category, products]) =>
          <React.Fragment key={category}>
            <div className="category">
              <CategoryEditorField category={category} products={products} enabled={edit} />
              {edit && <button style={{ float: 'right' }} onClick={addProduct(category)}>➕</button>}
            </div>
            <div className='product-list'>
              {products.map((p, i) => <Product
                key={p.id}
                model={p}
                admin={admin}
                edit={edit}
              />)}
            </div>
          </React.Fragment>
        )}
      </section>
    </Root>
  )
}