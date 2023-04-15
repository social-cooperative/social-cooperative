import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import styled from 'styled-components'
import { AuthUI, AuthUIPortable, useUser } from './AuthShield'
import { useEffect } from 'react'

interface IAlertDialog {
    isOpened: boolean
    onClose: () => void
}

const Root = styled.div`
    text-align: left;
    min-width: 540px;
    min-height: 400px;
`

const Heading = styled.span`
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.1px;
`

const Description = styled.p`
    font-size: 18px;
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 18px;
`

const List = styled.ol`
    margin-left: 26px;
    font-size: 18px;
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 18px;
    li {
        margin-bottom: 8px;
    }
    ol {
        padding-left: 24px;
        margin-top: 18px;
        margin-bottom: 22px;
        list-style: lower-alpha;
    }
`

export default function LoginRequestModal({ isOpened, onClose }: IAlertDialog) {
    const user = useUser()
    useEffect(() => isOpened && user && onClose(), [onClose, isOpened, user])
    return (
        <Dialog
            open={isOpened}
            onClose={onClose}
            aria-labelledby="cooperate-dialog-title"
            aria-describedby="cooperate-dialog-description"
        >
            <DialogTitle id="cooperate-dialog-title">
                <Heading>
                    Для добавления товара в корзину войдите
                </Heading>
            </DialogTitle>
            <DialogContent id="cooperate-dialog-description">
                <Root>
                    <AuthUIPortable user={user}/>
                </Root>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
            </DialogActions>
        </Dialog>
    )
}