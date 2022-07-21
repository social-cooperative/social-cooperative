// Firebase App (the core Firebase SDK) is always required and must be listed first
import _firebase from 'firebase/app'
export const firebase = _firebase
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from 'firebase/app'

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics'

// Add the Firebase products that you want to use
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

import { Requests } from '@valentine-stone/rtdb-requests'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWyM_PuA_1uP0temuN8aY6saa5bRYV8_A",
  authDomain: "social-cooperative.firebaseapp.com",
  projectId: "social-cooperative",
  storageBucket: "social-cooperative.appspot.com",
  messagingSenderId: "1014147907668",
  appId: "1:1014147907668:web:62f120f047b7c123892dc1",
  measurementId: "G-6MND7EWP7K",
  databaseURL: 'https://social-cooperative-default-rtdb.europe-west1.firebasedatabase.app'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
export const firestore = firebase.firestore()
export const database = firebase.database()
export const storage = firebase.storage()
export const auth = firebase.auth()
auth.useDeviceLanguage()

export const logout = () => auth.signOut()
export const logoutAndReload = () => auth.signOut()
  .then(() => location.reload())
  .catch(() => location.reload())

let loggedIn = false
const loginCallbacks = []
export const onLogin = callback => {
  if (loggedIn) callback(auth)
  else loginCallbacks.push(callback)
}
auth.onAuthStateChanged(user => {
  user && user.getIdTokenResult().then(({ claims: { admin } }) => {
    if (admin && !loggedIn) {
      loggedIn = true
      for (const callback of loginCallbacks)
        callback(auth)
    }
  })
})

export type Snap = _firebase.database.DataSnapshot

export const requests = new Requests()

onLogin(() => {
  requests.mount(database, auth.currentUser.uid)
  window.addEventListener('beforeunload', requests.unmount)
})

import { once } from './utils'
export const get_value = async (path) => await once(database.ref(path), 'value')
  .then(v => v.val())