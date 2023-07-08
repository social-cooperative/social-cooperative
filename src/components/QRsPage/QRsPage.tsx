import { Typography } from '@mui/material'
import styled from 'styled-components'

const Root = styled.div`

padding: 0px 40px;
font-family: Inter, sans-serif;
color: rgb(61, 61, 72);
font-style: normal;
font-weight: 400;
font-size: 18px;
line-height: 1.45;

h2 {
    margin: 32px 0 32px;
    font-weight: 400;
    font-size: 36px;
}

.flex {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.qr-item {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    margin: 0 12px;

    img {
        display: inline-block;
        width: 320px;
    }

    h3 {
        font-size: 24px;
        font-weight: 400;
        margin-bottom: 12px;
    }
}
`

export default function QRsPage() {

    return (
        <Root>
            <h2>QR-коды для оплат</h2>
            <div className='flex'>
                <article className='qr-item'>
                    <h3>Общий паевой взнос</h3>
                    <Typography><b>Назначение</b>: Общий паевой взнос. Без НДС</Typography>
                    <Typography><b>Сумма</b>: без суммы</Typography>
                    <img src="qr-main.jpg" alt="QR, Общий паевой взнос" />
                </article>
                <article className='qr-item'>
                    <h3>Вступительный паевой взнос</h3>
                    <Typography><b>Назначение</b>: Вступительный паевой взнос. Без НДС</Typography>
                    <Typography><b>Сумма</b>: 1000.00 ₽</Typography>
                    <img src="qr-intro-1000.png" alt="QR, Вступительный паевой взнос, 1000 ₽" />
                </article>
                <article className='qr-item'>
                    <h3>Членский паевой взнос</h3>
                    <Typography><b>Назначение</b>: Членский  паевой взнос. Без НДС</Typography>
                    <Typography><b>Сумма</b>: 100.00 ₽</Typography>
                    <img src="qr-member-100.png" alt="QR, Членский паевой взнос, 1000 ₽" />
                </article>
            </div>
        </Root>
    )
}