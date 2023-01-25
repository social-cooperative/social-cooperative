import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography }from '@mui/material';
import styled from 'styled-components';
import { toCurrencyStringRu } from '../utils';  
import {QRCodeSVG} from 'qrcode.react';

const getDetails = ({ total, timestamp, phone }: IPayDetails) => ({
    Name: 'ПК "СОЦКООП"',
    PersonalAcc: '40703810901500002456',
    BankName: 'ТОЧКА ПАО БАНКА "ФК ОТКРЫТИЕ"',
    BIC: '044525999',
    CorrespAcc: '30101810845250000999',
    PayeeINN: '9715431330',
    KPP: '771501001',
    Purpose: `Паевой взнос №${timestamp.trim()} @${phone.trim()}. Без НДС`,
    Sum: Number(`${total}00`),
  })
  
  export interface IPayDetails {
    total: string
    phone: string
    timestamp: string
  }
  
  export const createQRLink = (details: IPayDetails) => {
    return 'ST00012|' + Object.entries(getDetails(details)).map(item => item.join('=')).join('|');
  }

interface IAlertDialog {
    isOpened: boolean;
    id: string;
    first?: boolean;
    details: IPayDetails;
    onClose: () => void;
}

const Root = styled.div`
    text-align: center;

    .image-wrapper {
        margin: 24px 0
    }
    
    img {
        width: 240px;
        height: 240px;
        margin: 0 auto;
        display: block;
        text-align: center;
    }
`

export default function QRModal({ isOpened, id, onClose, first = false, details }: IAlertDialog) {
  return (
        <Dialog
        open={isOpened}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        >
        <DialogTitle id="alert-dialog-title">
            {`Оплата заказа №${id} от ${details.timestamp} на сумму ${toCurrencyStringRu(details.total)}`}
        </DialogTitle>
        <DialogContent id="alert-dialog-description">
            <Root>
                Используйте для оплаты своё банковское приложение на смартфоне. Банк может взимать комиссию за перевод.
                <div className='image-wrapper'>
                    <QRCodeSVG value={createQRLink(details)} size={320}/>
                </div>
                {first && 
                <Typography>
                    Актуальную ссылку на оплату можно получить в списке заказов.    
                </Typography>}
                Обратите внимание, что заказ необходимо оплатить до окончания закупки, неоплаченный заказ не будет взят в работу.
            </Root>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
        </Dialog>
  );
}