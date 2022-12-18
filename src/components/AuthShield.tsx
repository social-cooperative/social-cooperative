import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import { memo } from 'react'

import { auth, firebase, logout } from '../firebase'
import { timeout, useDispatch } from '../utils'

const ShiedRoot = styled.div`
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;
`

const ShiedInner = styled.div`
  text-align: center;
  position: relative;
`

const Progress = styled.div`
  @keyframes progressKeyframes {
    0% {
      left: -140px;
    }
    50% {
      left: 100%;
    }
    100% {
      left: -140px;
    }
  }
  position: relative;
  width: 360px;
  height: 5px;
  overflow: hidden;
  margin: 0 auto;
  &:before {
    box-sizing: border-box;
    background: black;
    border-right: 55px solid #cc0000;
    content: '';
    position: absolute;
    height: 100%;
    width: 140px;
    left: -140px;
    animation: progressKeyframes 1.7s linear infinite;
    animation-delay: 1s;
  }
`

const ShiedLogo = styled.img.attrs(
  () => ({ src: '/logo.svg' })
)`
  display: block;
  width: 360px;
  margin: 1em auto;
`

const uiConfig = {
  signInFlow: 'popup',
  callbacks: {
    signInSuccessWithAuthResult: () => false,
  },
  signInOptions: [
    {
      defaultCountry: 'RU',
      provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    },
    //firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    //firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
}

const Delay = ({ ms, children, force = false }) => {
  const [show, setShow] = useState(false)
  useEffect(() => timeout(() => setShow(true), ms), [ms])
  return (show || force) ? children : null
}

function AuthShield({ children }) {
  const [user, setUser] = useState(auth.currentUser || undefined)
  const [permitted, setPermitted] = useState(false)
  const dispatch = useDispatch()
  useEffect(() => auth.onAuthStateChanged(user => {
    if (user) {
      user.getIdTokenResult().then(({ claims }) => {
        user.getIdTokenResult(true).then(fresh => {
          setUser(user)
          if (fresh.claims.user_id !== claims.user_id)
            logout()
          if (fresh.claims.user_id) {
            dispatch('set', ['user', user])
            dispatch('set', ['claims', fresh.claims])
            setPermitted(claims.user_id)
          }
        })
      })
    } else setUser(null)
  }), [])
  return permitted ? children : (
    <ShiedRoot>
      <ShiedInner>
        <Delay ms={1000} force={user === null}><ShiedLogo /></Delay>
        {user === undefined
          ? <Delay ms={1000} force={user === null}><div><Progress /></div></Delay>
          : (
            user ? (
              <div>
                This user has no access <a href="#" onClick={logout}>Logout</a>
                <br />
                <br />Request access for uid
                <br />{user.uid}
              </div>
            ) : (
              <StyledFirebaseAuth
                uiConfig={uiConfig}
                firebaseAuth={firebase.auth()}
              />
            )
          )
        }
      </ShiedInner>
    </ShiedRoot>
  )
}

export default memo(AuthShield)