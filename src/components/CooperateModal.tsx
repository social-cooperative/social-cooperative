import { Button, Dialog, DialogActions, DialogContent, DialogTitle }from '@mui/material';
import styled from 'styled-components';

interface IAlertDialog {
    isOpened: boolean;
    onClose: () => void;
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

export default function ProductDetailsModal({ isOpened, onClose }: IAlertDialog) {
  return (
        <Dialog
        open={isOpened}
        onClose={onClose}
        aria-labelledby="cooperate-dialog-title"
        aria-describedby="cooperate-dialog-description"
        >
            <DialogTitle id="cooperate-dialog-title">
                <Heading>
                    Продукты для кооперации
                </Heading>
            </DialogTitle>
            <DialogContent id="cooperate-dialog-description">
                <Root>
                    <Description>
                        Продукты для кооперации — это продукты, сгруппированные поставщиком в упаковки по несколько штук. Например, 12 килограммовых пачек риса в одной упаковке.
                    </Description>
                    <Description>
                        Для покупки таких продуктов мы предлагаем пайщикам кооперироваться в таком формате:
                    </Description>
                       <List>
                        <li>Пайщики договариваются в чате о кооперации;</li>
                        <li>Пайщик №1 кладет себе в корзину продукт помеченный для кооперации;</li>
                        <li>
                            В корзине пайщик №1 заполняет специальное поле, где указывает:
                            <ol>
                                <li>ФИО пайщика № 2 и телефон;</li>
                                <li>Прописывает какое количество продукта получит пайщик № 1, а сколько пайщик №2.</li>
                            </ol>
                        </li>
                        <li>Пайщик № 1 оплачивает 100% продукта;</li>
                        <li>Расчет между собой пайщики № 1 и № 2 производят самостоятельно.</li>
                       </List>
                </Root>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
            </DialogActions>
        </Dialog>
  );
}