import styled, { createGlobalStyle } from 'styled-components'

const CssReset = createGlobalStyle`
/* Box sizing rules */
* { box-sizing: border-box }

/* Remove default padding */
ul, ol { padding: 0 }

/* Remove default margin */
body, h1, h2, h3, h4, p, ul, ol, li, figure,
figcaption, blockquote, dl, dd { margin: 0 }

/* Make body (and app) like in html 4 */
body, html, #app { min-height: 100% }

/* Make images easier to work with */
img { max-width: 100% }

/* Why does canvas even have focus?.. */
canvas:focus { outline: none }

/* Inherit fonts for inputs and buttons */
input, button, textarea, select {
  font: inherit;
  color: inherit;
  min-width: 0;
}

/* Lighten up the default tabindex outline */
*:focus { outline-color: rgba(0,0,0,0.2) }

/* Remove animations and transitions for people who prefer not to see them */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`

const CssGlobals = createGlobalStyle`
.expands {
  width: 100%;
  height: 100%;
}
`

import { useMediaQuery } from 'react-responsive'
import { useState, useEffect, Children } from 'react'
import { Provider, dispatch } from './store'
import { log, subscribe, useDispatch, useSelector } from './utils'
import { auth, logout } from './firebase'
import AuthShield from './components/AuthShield'
const logoutAndReload = () => logout().then(() => location.reload())

import { database } from './firebase'

import ProductList from './components/ProductList'
import Cart from './components/Cart'
import AppBar from './components/AppBar'
import UserMenu from './components/UserMenu'
import Orders from './components/Orders'
import Procurement from './components/Procurement'

const Pathnames = () => {
  const pathname = location.pathname.slice(1)

  switch (pathname) {
    case 'cart': return <Cart />
    case 'orders': return <Orders />
    case 'procurement': return <Procurement />
    default: return <>
      <ProductList />
    </>
  }

}

export default function App() {

  return (
    <Provider>
      <CssReset />
      <CssGlobals />
      <AuthShield>
        <AppBar />
        <UserMenu />
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Pathnames />
        </div>
      </AuthShield>
    </Provider>
  )
}