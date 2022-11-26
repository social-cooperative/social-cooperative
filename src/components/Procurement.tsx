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
import DeleteIcon from '@mui/icons-material/Delete'

import React from 'react'

import { auth, database } from '../firebase'
import { Table, CellImg } from './Table'

const Root = styled.div`
  padding: 1em;
`

const adminSelector = store => !!store.claims.admin

const ru = new Intl.NumberFormat("ru", { style: "currency", currency: "RUB" })

import { log, productsTotal, subscribe, useCounter, useSelector, useToggle } from '../utils'
import { useCallback, useEffect, useState } from 'react'

const useProcurement = () => {
  const [orders, setOrders] = useState({})
  useEffect(() => subscribe(
    database.ref('orders'),
    'value',
    snap => setOrders(snap.val() || {})
  ), [])
  let total = 0
  let count = 0
  for (const id in orders)
    for (const id2 in orders[id]) {
      total += productsTotal(orders[id][id2].products)
      count++
    }
  return [total, count] as any
}

export default () => {
  const admin = useSelector(adminSelector)
  const [orders, setOrders] = useState({})
  useEffect(() => subscribe(
    database.ref(`orders`),
    'value',
    snap => setOrders(snap.val() || {})
  ), [])
  return admin ? <Orders orders={orders} /> : null
}

const dateRuConfig = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
} as any

import { Order } from './Orders'
import PageTitle from './PageTitle'
import { categorize } from './ProductList'



const useProducts = orders => {
  const users = Object.values<any>(orders)
  const products = {}

  for (const user of users) {
    for (const orderId in user) {
      const order = user[orderId]
      for (const slug in order.products) {
        if (products[slug])
          products[slug].count += order.products[slug].count
        else
          products[slug] = { ...order.products[slug], ...order.products[slug].product }
      }
    }
  }
  const categories = categorize(products)
  for (const category in categories) {
    categories[category] = {
      products: categories[category],
      total: productsTotal(categories[category])
    }
  }
  return categories
}

const ByProductProduct = ({ product, darker }) => (
  <tr style={{ background: darker ? '#E7F7EB' : undefined }}>
    <td><Typography>{product.name}</Typography></td>
    <td><Typography>{product.unit}</Typography></td>
    <td><Typography>{product.price}</Typography></td>
    <td><Typography>{product.unit} x{product.count}</Typography></td>
    <td><Typography>{product.price * product.count}р.</Typography></td>
  </tr>
)

const ByProducts = ({ orders }) => {
  const products = useProducts(orders)
  return <>{
    Object.entries<any>(products).map(([category, { products, total }]) =>
      <React.Fragment key={category}>
        <tr className="category">
          <td colSpan={100} style={{ background: '#bae5c6' }}>
            <Typography variant="h6">{category}, всего на <b>{ru.format(total)}</b></Typography>
          </td>
        </tr>
        {products.map((product, i) =>
          <ByProductProduct key={product.id} product={product} darker={i % 2} />
        )}
      </React.Fragment>
    )
  }</>
}

const sortByDate = ([ka, a], [kb, b]) => b.date - a.date

export const Orders = ({ orders = {} }) => {
  const [byProducts, toggleByProducts] = useToggle(false)
  const [total, count] = useProcurement()
  const finishProcurement = useCallback(() => {
    const procured = Date.now()
    Promise.all(Object.entries<any>(orders).map(([uid, order]) => {
      for (const id in order) order[id].procured = procured
      return database.ref(`ordersHistory/${uid}`).update(order)
        .then(() => Promise.all(Object.entries<any>(order).map(([id]) => {
          database.ref(`orders/${uid}/${id}`).set(null)
        })))
    }))
  }, [orders])
  return (
    <Root>
      <PageTitle>
        Закупка
        <button style={{ float: 'right' }} onClick={toggleByProducts}>{byProducts ? 'По клиентам' : 'По продуктам'}</button>
      </PageTitle>
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
          {byProducts
            ? <ByProducts orders={orders} />
            : Object.entries<any>(orders).sort(sortByDate).map(([id, orders]) =>
              <React.Fragment key={id}>
                <tr className="category">
                  <td colSpan={100} style={{ background: '#bae5c6' }}>
                    <Typography variant="h5">
                      Пользователь <b>{Object.values<any>(orders)[0]?.phone}</b>,
                      заказов: {Object.values(orders).length},
                      на сумму: <b>{ru.format(Object.values<any>(orders).reduce((acc, order) => acc += productsTotal(order.products), 0))}</b>
                    </Typography>
                  </td>
                </tr>
                {Object.entries<any>(orders).sort(sortByDate).map(([id, order]) =>
                  <Order key={id} id={id} order={order} cancellable />
                )}
              </React.Fragment>
            )
          }
          {!Object.entries<any>(orders).length
            ?
            <tr><td colSpan={100}>
              <Typography variant="h6" align="center">В закупке нет заказов</Typography>
            </td></tr>
            :
            <tr className="category no-center">
              <td colSpan={100}>
                <button onClick={finishProcurement} style={{ padding: '1em', display: 'block', width: '100%' }} >
                  <Typography variant="h5">Закрыть закупку на {ru.format(total)}</Typography>
                </button>
              </td>
            </tr>
          }
        </tbody>
      </Table>
    </Root>
  )
}