import Typography from '@mui/material/Typography'
import styled from 'styled-components'
import { useCallback, useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import PeopleIcon from '@mui/icons-material/People';

import QRModal from './QRModal';
import { productsTotal, subscribe, toCurrencyStringRu, toLocaleStringRu } from '../utils'
import PageTitle from './PageTitle'
import { auth, database } from '../firebase'
import { Table } from './Table'
import AuthShield from './AuthShield'

const Root = styled.div`
  padding: 1em;

  .pay-wrapper {
    margin-top: 8px;
    text-align: left;
  }
`

const adminSelector = store => !!store.claims.admin

export const Product = props => {
  const { model } = props
  const total = productsTotal(model)
  return (
    <tr className="product" style={{ background: props.darker ? '#E7F7EB' : undefined }}>
      <td>
        <Typography title={model.product.comment}>
          {model.product.name} 
          {!!model.product.category && <small>({model.product.category})</small>}
          &nbsp;
          {!!model.forChange && <ChangeCircleIcon color="success" style={{verticalAlign: 'middle'}}/>}
        </Typography>
      </td><td>
        <Typography>
          {model.product.unit}
        </Typography>
      </td><td>
        <Typography>
          {model.product.weight}
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
      </td>
    </tr>
  )
}

const ru = new Intl.NumberFormat("ru", { style: "currency", currency: "RUB" })

const OrdersContainer = () => {

  const [history, setHistory] = useState({})
  useEffect(() => subscribe(
    database.ref('ordersHistory'),
    'value',
    snap => setHistory(snap.val() || {})
  ), []);

  useEffect(() => subscribe(
    database.ref(`ordersHistory`),
    'value',
    snap => setHistory(snap.val() || {})
  ), [])

  const [orders, setOrders] = useState({})
  useEffect(() => subscribe(
    database.ref(`orders/${auth.currentUser.uid}`),
    'value',
    snap => setOrders(snap.val() || {})
  ), [])

  const [ordersHistory, setOrdersHistory] = useState({})
  useEffect(() => subscribe(
    database.ref(`ordersHistory/${auth.currentUser.uid}`),
    'value',
    snap => setOrdersHistory(snap.val() || {})
  ), [])
  const [ordersCanceled, setOrdersCanceled] = useState({})
  useEffect(() => subscribe(
    database.ref(`ordersCanceled/${auth.currentUser.uid}`),
    'value',
    snap => setOrdersCanceled(snap.val() || {})
  ), [])
  return <Orders orders={orders} ordersHistory={ordersHistory} ordersCanceled={ordersCanceled} />
}

export default () => (
  <AuthShield>
    <OrdersContainer/>
  </AuthShield>
)

export const Order = ({ order, id, cancellable = false, deletable = false, actual = false, withPhone = false }) => {
  const { products, date } = order
  const total = productsTotal(products)
  const orderedAt = toLocaleStringRu(date)
  const placedOrderId = date

  const [isQRModalOpened, setIsQRModalOpened] = useState(false)

  const openModal = () => { setIsQRModalOpened(true) };
  const closeModal = () => { setIsQRModalOpened(false) };

  const cancelOrder = useCallback(() => {
    if (cancellable && confirm(`Вы собираетесь удалить заказ пользователя ${order.name}${order.name && ' '}${order.phone} от ${orderedAt} на сумму ${toCurrencyStringRu(total)}, это действие невозможно отменить.\n\nВы уверены?`)) {
      database.ref(`ordersCanceled/${order.uid}/${id}`).set(order)
        .then(() => database.ref(`orders/${order.uid}/${id}`).set(null))
        .catch(() => { })
    }
  }, [id, order, orderedAt, cancellable])

  const deleteOrder = useCallback(() => {
    if (deletable && confirm(`Вы собираетесь удалить ваш отменённый заказ от ${orderedAt} на сумму ${toCurrencyStringRu(total)}, это действие невозможно отменить.\n\nВы уверены?`)) {
      database.ref(`ordersCanceled/${order.uid}/${id}`).set(null)
        .catch(() => { })
    }
  }, [id, order, orderedAt, deletable])

  const details = {
    timestamp: orderedAt,
    phone: order.phone,
    total
  }
  const optionForNotCalled = order.isRemoveIfNotCalled ? 'удалить' : 'заменить';

  return <>
    {actual && <QRModal isOpened={isQRModalOpened} id={placedOrderId} onClose={closeModal} details={details}/>}
    <tr className="category">
      <td colSpan={100}>
        {cancellable && <button style={{ float: 'right' }} onClick={cancelOrder} disabled>🗑️</button>}
        {deletable && <button style={{ float: 'right' }} onClick={deleteOrder} disabled>🗑️</button>}
        <Typography variant="h6">
          Заказ от <b>{orderedAt}</b> <b>{withPhone ? order.phone : ''}</b> на сумму <b>{toCurrencyStringRu(total)}</b>
        </Typography>
        {!!actual && <Typography className='my-2' style={{margin: '8px 0'}}>
          Для отмены заказа, пожалуйста, напишите в <a href="https://t.me/+mBf0r2he1U43MmQy" target='_blank'>чат пайщиков</a>
        </Typography>}
        {!!order.name && <Typography align="left">
          {order.name}
        </Typography>}
        {!!order.address && <Typography align="left">
          {order.address}
        </Typography>}
        {!!order.comment && <Typography align="left">
          {order.comment}
        </Typography>}
        {!!order.wantToChange && 
          <Typography align="left">
            Есть продукты для замены, в случае недозвона {optionForNotCalled} продукты
          </Typography>
        }
        {!!order.wantToCooperate && 
        <Typography align="left">
          <b>Детали кооперации:</b><br/>
          {order.cooperateDetails}
        </Typography>
        }
        {actual && <div className='pay-wrapper'><Button variant="outlined" onClick={openModal}>Оплатить</Button></div>}
      </td>
    </tr>
    {Object.entries<any>(products).map(([id, p], i) => <Product
      key={id}
      model={p}
      darker={i % 2}
    />)}
  </>
}

const sortByDate = ([ka, a], [kb, b]) => b.date - a.date

export const Orders = ({ orders = {}, ordersHistory = {}, ordersCanceled = {} }) => {
  return (
    <Root>
      <PageTitle>Текущие заказы</PageTitle>
      <Table>
        <thead>
          <tr>
            <td><Typography>Наименование</Typography></td>
            <td><Typography>Ед. изм.</Typography></td>
            <td><Typography>Вес (кг)</Typography></td>
            <td><Typography>Цена</Typography></td>
            <td><Typography>Кол-во</Typography></td>
            <td><Typography>Стоимость</Typography></td>
          </tr>
        </thead>
        <tbody>
          {Object.entries<any>(orders).sort(sortByDate).map(([id, order]) =>
            <Order key={id} id={id} order={order} actual/>
          )}
          {!Object.entries(orders).length &&
            <tr><td colSpan={100}>
              <Typography variant="h6" align="center">У вас нет текущих заказов</Typography>
            </td></tr>
          }
        </tbody>
      </Table>

      <PageTitle sx={{ marginTop: '1em' }}>Исполненные заказы</PageTitle>
      <Table>
        <thead>
          <tr>
            <td><Typography>Наименование</Typography></td>
            <td><Typography>Ед. изм.</Typography></td>
            <td><Typography>Цена</Typography></td>
            <td><Typography>Кол-во</Typography></td>
            <td><Typography>Стоимость</Typography></td>
          </tr>
        </thead>
        <tbody>
          {Object.entries<any>(ordersHistory).sort(sortByDate).map(([id, order]) =>
            <Order key={id} id={id} order={order} />
          )}
          {!Object.entries(ordersHistory).length &&
            <tr><td colSpan={100}>
              <Typography variant="h6" align="center">У вас нет исполненных заказов</Typography>
            </td></tr>
          }
        </tbody>
      </Table>

      <PageTitle sx={{ marginTop: '1em' }}>Отменённые заказы</PageTitle>
      <Table>
        <thead>
          <tr>
            <td><Typography>Наименование</Typography></td>
            <td><Typography>Ед. изм.</Typography></td>
            <td><Typography>Цена</Typography></td>
            <td><Typography>Кол-во</Typography></td>
            <td><Typography>Стоимость</Typography></td>
          </tr>
        </thead>
        <tbody>
          {Object.entries<any>(ordersCanceled).sort(sortByDate).map(([id, order]) =>
            <Order key={id} id={id} order={order} deletable />
          )}
          {!Object.entries(ordersCanceled).length &&
            <tr><td colSpan={100}>
              <Typography variant="h6" align="center">У вас нет отменённых заказов</Typography>
            </td></tr>
          }
        </tbody>
      </Table>
    </Root>
  )
}