import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import styled from 'styled-components'

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
                        Продукты для кооперации — это продукты, сгруппированные поставщиком в упаковки 
                        по несколько штук. Например, 12 килограммовых пачек риса в одной упаковке.
                    </Description>
                    <Description>
                        Для закупки таких товаров мы предлагаем пайщикам кооперироваться в онлайн-формате 
                        и выкупать позицию по частям (по слотам). Индикацию статуса выкупа одной позиции 
                        можно увидеть на её карточке. Оплата выбранных слотов осуществляется теперь через 
                        корзину, как и для всех прочих продуктов.
                    </Description>
                    <Description>
                        Мы оставляем за собой право отказать в покупке товаров по кооперации, если заполнено 
                        меньше 2/3 слотов по данному продукту. Если же после удаления такой позиции из заказа 
                        его сумма будет меньше 3000 рублей, то с Вами свяжется наш сотрудник для согласования 
                        заполнения корзины до нужной суммы.
                    </Description>
                </Root>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
            </DialogActions>
        </Dialog>
    )
}