import { Typography } from '@mui/material'
import { useEffect, useState, useCallback, memo } from 'react'
import styled from 'styled-components'

const MenuRoot = styled.div`
  background: white;
  box-shadow: 0 0 8px #0000001e;
  padding-top: 90px;
  overflow: hidden;
`

const MenuButton = styled.button`
  font-size: 20pt;
  padding: 0.5em;
  text-align: center;
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  &:hover { background: #f4f4f4 }
`

const MenuText = styled(Typography)<{ size?: number }>`
  font-size: ${({ size = 20 }) => size}pt;
  padding: 0.5em;
  text-align: center;
`

type UserIcon_props_t = { variant?: any }

let UserIcon: any = styled.img.attrs<UserIcon_props_t>(
  ({ variant }) => ({ src: `/user-icons/${variant || Math.round(Math.random() * 19)}.png` })
) <UserIcon_props_t>`
  font-size: 20pt;
  display: block;
  margin: 0 auto 0.5em auto;
`
UserIcon = memo(UserIcon)

import { firebase, logoutAndReload } from '../firebase'
import { useSelector } from '../utils'

const selectUser = store => store.user

const AppMenu = memo(
  function AppMenu() {
    const user = useSelector(selectUser)
    return (
      <MenuRoot className="expands">
        <UserIcon />
        <MenuText>{user?.displayName}</MenuText>
        <MenuText>{user?.phoneNumber}</MenuText>
        <MenuText size={8}>{user?.uid}</MenuText>
        <MenuButton onClick={logoutAndReload}>
          <Typography variant="h6">Выйти</Typography>
        </MenuButton>
      </MenuRoot>
    )
  }
)

import { useDispatch } from '../utils'
import Drawer from './Drawer'

const selectUserMenuOpen = store => store.userMenuOpen
function UserMenu() {
  const userMenuOpen = useSelector(selectUserMenuOpen)
  const [toggleUserMenuOpen] = useDispatch([
    d => () => d('toggle', 'userMenuOpen')
  ], [])
  return (
    <Drawer left size={250} open={userMenuOpen} zIndex={14} onClose={toggleUserMenuOpen}>
      <AppMenu />
    </Drawer>
  )
}

export default memo(UserMenu)