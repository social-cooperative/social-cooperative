import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import styled from 'styled-components';

interface IAlertDialog {
    isOpened: boolean;
    id: string;
    onClose: () => void;
}

const Root = styled.div`
    text-align: center;
    
    img {
        width: 240px;
        height: 240px;
        margin: 0 auto;
        display: block;
        text-align: center;
    }
`

export default function AlertDialog({ isOpened, id, onClose }: IAlertDialog) {
  return (
        <Dialog
        open={isOpened}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        >
        <DialogTitle id="alert-dialog-title">
            {`Оплата заказа от ${id}`}
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                <Root>
                    При оплате с телефона используйте <a href="http://createqr.ru">ссылку</a>.
                    <div className='image-wrapper'>
                        <img src="http://createqr.ru/invoice?Name=Иванов И. И.&PersonalAcc=40802810902280000111&BankName=АО 'АЛЬФА-БАНК' &BIC=044525593&CorrespAcc=30101810200000000593&SumRub=100&Purpose=Оплата по счету" alt="QR-код для оплаты" />
                    </div>
                    Обратите внимание, что заказ необходимо оплатить до окончания закупки, неоплаченный заказ не будет взят в работу.
                </Root>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
        </Dialog>
  );
}