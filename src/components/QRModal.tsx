import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography }from '@mui/material';
import styled from 'styled-components';
import { createQRLink, IPayDetails } from '../utils';

interface IAlertDialog {
    isOpened: boolean;
    id: string;
    first?: boolean;
    details: IPayDetails;
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

export default function QRModal({ isOpened, id, onClose, first = false, details }: IAlertDialog) {
  return (
        <Dialog
        open={isOpened}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        >
        <DialogTitle id="alert-dialog-title">
            {`Оплата заказа №${id} от ${details.timestamp} на сумму ${details.total} ₽`}
        </DialogTitle>
        <DialogContent id="alert-dialog-description">
            <Root>
                Используйте для оплаты своё банковское приложение.
                <div className='image-wrapper'>
                    <img src={createQRLink(details)} />
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