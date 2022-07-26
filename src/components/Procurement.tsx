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

const sortByDate = ([ka, a], [kb, b]) => b.date - a.date

export const Orders = ({ orders = {} }) => {
  let [total, count] = useProcurement()
  const finishProcurement = useCallback(() => {
    const procured = Date.now()
    Promise.all(Object.entries<any>(orders).map(([uid, order]) => {
      for (const id in order) order[id].procured = procured
      return database.ref(`ordersHistory/${uid}`).update(order)
    })).then(() =>
      database.ref(`orders`).set(null)
    )
  }, [orders])
  return (
    <Root>
      <Typography variant="h4">Закупка</Typography>
      <Table>
        <thead>
          <tr>
            <td><Typography>Наименование</Typography></td>
            <td><Typography>Единица измерения</Typography></td>
            <td><Typography>Цена</Typography></td>
            <td><Typography>Кол-во</Typography></td>
            <td><Typography>Стоимость</Typography></td>
          </tr>
        </thead>
        <tbody>
          {Object.entries<any>(orders).sort(sortByDate).map(([id, orders]) =>
            <React.Fragment key={id}>
              <tr className="category">
                <td colSpan={100} style={{ background: '#aaaaaa' }}>
                  <Typography variant="h5">
                    Пользователь <b>{Object.values<any>(orders)[0]?.phone}</b>,
                    заказов: {Object.values(orders).length},
                    на сумму: {ru.format(Object.values<any>(orders).reduce((acc, order) => acc += productsTotal(order.products), 0))}
                  </Typography>
                </td>
              </tr>
              {Object.entries<any>(orders).sort(sortByDate).map(([id, order]) =>
                <Order key={id} id={id} order={order} />
              )}
            </React.Fragment>
          )}
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