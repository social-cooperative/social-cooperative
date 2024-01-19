import styled from 'styled-components'

import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import AppBar from '@mui/material/AppBar'
import Stack from '@mui/material/Stack'
import Badge from '@mui/material/Badge'

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PersonIcon from '@mui/icons-material/Person'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'

import { productsTotal, subscribe, toCurrencyStringRu, useSelector } from '../utils'
import { auth, database } from '../firebase'
import { useEffect, useState } from 'react'

const AppToolbar = styled(Toolbar)`
  top: 0;
  background-color: white;
`

const A = styled.a`
  text-decoration: none;
  color: inherit;
`

const adminSelector = store => !!store.claims.admin

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
      orders[id][id2]
      total += productsTotal(orders[id][id2].products)
      count++
    }
  return [total, count] as any
}

import { useDispatch } from '../utils'

export default () => {

  const [toggleUserMenuOpen] = useDispatch([
    d => () => d('toggle', 'userMenuOpen')
  ], [])

  const [ordersCount, setOrdersCount] = useState(0)


  useEffect(() => auth.onAuthStateChanged(user => {
    if (!user) return
    return subscribe(
      database.ref('orders').child(user.uid),
      'value',
      snap => {
        setOrdersCount(snap.numChildren())
      }
    )
  }), [auth.currentUser])

  const [cart, setCart] = useState(null)
  useEffect(() => auth.onAuthStateChanged(user => {
    if (!user) return
    subscribe(
      database.ref('carts').child(auth.currentUser.uid),
      'value',
      snap => {
        const total = productsTotal(snap.val());
        setCart(total ? toCurrencyStringRu(total) : '' as any)
      }
    )
  }), [auth.currentUser])

  const [procurementTotal, procurementOrderCount] = useProcurement()

  const admin = useSelector(adminSelector)

  return (
    <AppBar position="sticky" color="transparent">
      <AppToolbar>
        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }} alignItems="center">
          <div style={{ marginLeft: '1em', marginTop: '6px', marginRight: '32px' }}>
            <a href="/" >
              <img style={{ cursor: 'pointer', height: 25 }} src="logo.svg" />
            </a>
          </div>
          <A href="/about" style={{ color: 'rgba(0,0,0,0.54)', marginRight: '32px' }} title="Каталог">
            <Typography>
              О нас
            </Typography>
          </A>
          <A href="/memo" style={{ color: 'rgba(0,0,0,0.54)', marginRight: '32px' }} title="Памятка">
            <Typography>
              Памятка
            </Typography>
          </A>
          <A href="/qrs" style={{ color: 'rgba(0,0,0,0.54)', marginRight: '32px' }} title="QR-коды для оплат">
            <Typography>
              QR-коды для оплат
            </Typography>
          </A>
          <A href="/contacts" style={{ color: 'rgba(0,0,0,0.54)' }} title="Контакты и карта доставки">
            <Typography>
              Контакты и карта доставки
            </Typography>
          </A>

          <div style={{ flexGrow: 1 }} />

          {admin &&
            <A href="/procurement" title="Закупка">
              <Typography color="primary">
                {toCurrencyStringRu(procurementTotal)}
              </Typography>
            </A>
          }
          {admin &&
            <IconButton href="/procurement" color="primary" title="Закупка">
              {procurementOrderCount
                ? <Badge badgeContent={procurementOrderCount} color="primary">
                  <PointOfSaleIcon />
                </Badge>
                : <PointOfSaleIcon />
              }
            </IconButton>
          }


          <A href="/cart" style={{ color: 'rgba(0,0,0,0.54)' }} title="Корзина">
            <Typography>
              {cart}
            </Typography>
          </A>
          <IconButton href="/cart" title="Корзина">
            <ShoppingCartIcon />
          </IconButton>

          <IconButton href="/orders" title="Заказы">
            {ordersCount
              ? <Badge badgeContent={ordersCount} color="primary">
                <ReceiptIcon />
              </Badge>
              : <ReceiptIcon />
            }
          </IconButton>

          {!!auth.currentUser &&
            <IconButton onClick={toggleUserMenuOpen}>
              <PersonIcon />
            </IconButton>
          }

        </Stack>
      </AppToolbar>
    </AppBar>
  )
}