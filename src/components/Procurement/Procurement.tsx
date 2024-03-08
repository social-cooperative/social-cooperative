import Typography from '@mui/material/Typography'
import styled from 'styled-components'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@mui/material'

import { productsTotal, subscribe, toCurrencyStringRu, useSelector, useToggle } from '../../utils'
import { auth, database } from '../../firebase'
import { Table } from '../Table'
import { Order } from '../Orders'
import PageTitle from '../PageTitle'
import { categorize } from '../ProductList'
import { downloadReportByOrders } from './downloadReportByOrders'
import { downloadReportByProducts } from './downloadReportByProducts'
import { logReportInXML } from './logReportInXML'

const Root = styled.div`
  padding: 1em;
`

const generateListFromOrders = (orders) => {
  return Object.entries(orders).flatMap(([userId, ordersByKey]) => {
    return Object.entries(ordersByKey).map(([orderId, order]) => ({
      ...order, orderId, userId
    }));
  })
}

const adminSelector = store => !!store.claims.admin

const ru = new Intl.NumberFormat("ru", { style: "currency", currency: "RUB" })

const useProcurement = ({ historical, start, end }) => {
  const needsFilter = start !== 0 || end !== Infinity
  const [orders, setOrders] = useState({})
  useEffect(() => subscribe(
    database.ref(historical ? 'ordersHistory' : 'orders'),
    'value',
    snap => {
      const val = snap.val() || {}
      if (needsFilter)
        for (const uid in val) {
          for (const id in val[uid])
            if (val[uid][id].date < start || val[uid][id].date > end)
              delete val[uid][id]
          if (!Object.entries(val[uid]).length)
            delete val[uid]
        }
      setOrders(val)
    }
  ), [])
  let total = 0
  let count = 0
  for (const id in orders)
    for (const id2 in orders[id]) {
      total += productsTotal(orders[id][id2].products)
      count++
    }
  return [total, count, orders] as any
}

export default props => {
  const admin = useSelector(adminSelector)
  return admin && (
    <Orders
      historical={props.historical === ''}
      start={props.start ? +props.start : 0}
      end={props.end ? +props.end : Infinity}
    />
  )
}

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
    <td><Typography>{product.weight}</Typography></td>
    <td><Typography>{product.count}</Typography></td>
    <td><Typography>{product.price * product.count}</Typography></td>
  </tr>
)

const ByProducts = ({ orders }) => {
  const products = useProducts(orders)
  return <>{
    Object.entries<any>(products).map(([category, { products, total }]) =>
      <React.Fragment key={category}>
        <tr className="category">
          <td colSpan={100} style={{ background: '#bae5c6' }}>
            <Typography variant="h6">{category}, всего на <b>{toCurrencyStringRu(total)}</b></Typography>
          </td>
        </tr>
        {products.map((product, i) =>
          <ByProductProduct key={product.id} product={product} darker={i % 2} />
        )}
      </React.Fragment>
    )
  }</>
}

export const Orders = ({ historical = false, start = 0, end = Infinity }) => {
  const [byProducts, toggleByProducts] = useToggle(false)
  const [total, count, orders] = useProcurement({ historical, start, end })
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

  const handleRepostByOrders = () => downloadReportByOrders(orders);
  const handleReportByProducts = () => downloadReportByProducts(orders);
  const handleLogReportInXML = () => logReportInXML(orders);


  return (
    <Root>
      <PageTitle>
        Закупка
        <Button style={{ float: 'right' }} onClick={toggleByProducts}>{byProducts ? 'По клиентам' : 'По продуктам'}</Button>
      </PageTitle>
      <div>
        <Button onClick={handleRepostByOrders}>Позаказный отчёт</Button>
        <Button onClick={handleReportByProducts}>Пономенклатурный отчёт</Button>
        <Button onClick={handleLogReportInXML}>XML-отчёт в консоль</Button>
      </div>
      <Table>
        <thead>
          <tr>
            <td><Typography>Наименование</Typography></td>
            <td><Typography>Ед. изм.</Typography></td>
            <td><Typography>Вес</Typography></td>
            <td><Typography>Цена</Typography></td>
            <td><Typography>Кол-во</Typography></td>
            <td><Typography>Стоимость</Typography></td>
          </tr>
        </thead>
        <tbody>
          {byProducts
            ? <ByProducts orders={orders} />
            : generateListFromOrders(orders).sort((a, b) => b.date - a.date).map(
              (order, index) => <Order key={index} id={order.id} order={order} cancellable withPhone />
            )
          }
          {!Object.entries<any>(orders).length ? (
            <tr><td colSpan={100}>
              <Typography variant="h6" align="center">В закупке нет заказов</Typography>
            </td></tr>
          ) : (
            <tr className="category no-center">
              <td colSpan={100}>
                {historical ? (
                  <Typography variant="h5" align="center"><b>Итого закупка на {toCurrencyStringRu(total)}</b></Typography>
                ) : (
                  <button onClick={finishProcurement} style={{ padding: '1em', display: 'block', width: '100%' }} disabled={auth.currentUser.uid !== 'nQnxyUpQ5zY3oIdQB3A5kxTT6BG2'}>
                    <Typography variant="h5">Закрыть закупку на {toCurrencyStringRu(total)}</Typography>
                  </button>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Root>
  )
}
