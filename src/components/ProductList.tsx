import styled from 'styled-components'

import { auth, database, storage } from '../firebase'
import { CellImg } from './Table'
import { toCurrencyStringRu, useFirebaseValue } from '../utils'

import Accordion from '@mui/material/Accordion';
import Button from '@mui/material/Button';
import InfoIcon from '@mui/icons-material/Info';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
    color: #239F23;
    padding: 12px 0;
    font-size: 32px;
    font-weight: 600; 
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

const truncate = (str: string | undefined, n: number) => {
  if (!str) return '';
  return str.length <= n ? str : str.substring(0, n + 1) + '...'
}

const adminSelector = store => !!store.claims.admin

export const productSlug = model => model.id + '|' + hash(model.name + model.unit + model.price)

export const addToCart = (count, model) => {
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
}

const Product = props => {
  const [count, setCount, incCount, decCount] = useCounter(1, 1)
  const { model, edit, handleOpenCooperateModal } = props

  const [isDetailsModalOpened, setDetailsModalOpened] = useState(false);
  const openModal = () => { setDetailsModalOpened(true) };
  const closeModal = () => { setDetailsModalOpened(false) };

  const deleteProduct = useCallback(() => {
    if (!model.name || confirm(`Вы собираетесь удалить продукт "${model.name}", это действие невозможно отменить.\n\nВы уверены?`)) {
      if (model.image) storage.ref(model.image).delete().catch(() => { })
      database.ref(`products/${model.id}`).set(null).catch(() => { })
    }
  }, [model])

  const addToBasket = useCallback(() => addToCart(count, model), [count, model])

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
              <p>{model.unit || '-'} {model.unitName}</p>
            </div>
            {(model.description || model.about) && 
              <div>
                <Button onClick={openModal}>
                  Подробнее
                </Button>
              </div>
            }
          </div>
          <ProductDetailsModal isOpened={isDetailsModalOpened} onClose={closeModal} details={model} />
          {model.isForCooperate && 
            <Button onClick={handleOpenCooperateModal} endIcon={<InfoIcon />}>
              Продукт для кооперации
            </Button>
          }
          <footer className='product-section product-section-grid'>
            <div>
              <p className='product-price'>{model.price ? toCurrencyStringRu(model.price) : '-'}</p>
              <p className='product-unit-price'>
                {(!!model.unitPrice && `${model.unitPrice} ₽ за 1 ${model.unitName}`)}
                &nbsp;
              </p>
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
            <p className='product-label'>продукт для кооперации:</p>
            <FirebaseEditorCheckbox path={`/products/${model.id}/isForCooperate`} value={model.isForCooperate} enabled={edit} />
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
            <p className='product-label'>ед. измерения фасовки (кг. / шт. / л.):</p>
            <FirebaseEditorField path={`/products/${model.id}/unitName`} value={model.unitName} enabled={edit} />
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
          <div className='product-section'>
            <p className='product-label'>цена за 1 ед. измерения фасовки:</p>
            <FirebaseEditorField path={`/products/${model.id}/unitPrice`} value={model.unitPrice} enabled={edit} number />
          </div>
        </React.Fragment>
      }
      </div>
      {!edit && <button disabled={!canBuy} className='product-buy' onClick={addToBasket}>В корзину</button>}
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
import ProductDetailsModal from './ProductDetailsModal';
import { Badge } from '@mui/material';
import CooperateModal from './CooperateModal';

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
  const admin = useSelector(adminSelector);
  const [edit, toggleEdit] = useToggle(false);
  const products = useFirebaseValue('products', [], categorize);

  const [isCooperateModalOpened, setCooperateModalOpened] = useState(false);
  const openModal = () => {
    setCooperateModalOpened(true);
  };
  const closeModal = () => {
    setCooperateModalOpened(false);
  };

  const categoryList = (products) => Object.entries<any>(products).reduce((acc, [category, products]) => {
    if (products.some(({ hidden }) => hidden !== true) || edit) {
      acc.push([category, products])
    }
    return acc;
  }, [])
  
  const productList = (products, edit) => products.reduce((acc, product) => {
    if (!product.hidden || edit) {
      acc.push(product);
    }
    return acc;
  }, [])

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
              <React.Fragment key={category}>
                <Accordion>
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
                          handleOpenCooperateModal={openModal}
                        />
                      )}
                    </div>
                  </AccordionDetails>
                </Accordion>
              </React.Fragment>
        )}
      </section>
      <CooperateModal isOpened={isCooperateModalOpened} onClose={closeModal} />
    </Root>
  );
};
