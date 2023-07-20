import styled from 'styled-components';
import Root from '../AboutPage/AboutPage.style';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import mapLink from './mapLink';
import Button from '@mui/material/Button';

const Section = styled.div`
  display: flex; 
  flex-direction: column;

  p {
    line-height: 1.5;
  }
`

export default function MemoPage() {

  return (
    <>
      <Root>
        <div className='main-page'>
          <main className='main-page-content'>
            <Section style={{display: 'flex', flexDirection: 'column'}}>
              <h2 style={{marginBottom: 16}}>Контакты</h2>

              <h4 style={{marginBottom: 16}}>Потребительский кооператив «СоцКооп»</h4>
              <div style={{marginBottom: 16}}>
                <p>ИНН: 9715431330</p>
                <p>КПП: 771501001</p>
                <p>ОГРН: 1227700703878</p>
                <p>ОКПО: 84915489</p>
              </div>

              <p style={{marginBottom: 16}}>
                  Телефон: +7 (991) 120 63 36
              </p>
            

              <p style={{marginBottom: 16}}>
                <Button variant="outlined" startIcon={<TelegramIcon />} color="info" style={{marginRight: 12}} href='https://t.me/SocCoop_Moscow' target='_blank'>
                  Наш телеграм: @SocCoop_Moscow
                </Button>
              </p>

              <p style={{marginBottom: 16}}>
                <Button variant="outlined" startIcon={<WhatsAppIcon />} href='https://wa.me/79911206336' target='_blank'>
                  Наш WhatsApp: +7 (991) 120 63 36
                </Button>
              </p>

              <h4 id="delivery-map" style={{marginBottom: 8}}>Карта доставки</h4><br/>

              <p style={{position: 'relative', overflow: 'hidden'}}>
                  <iframe src={mapLink} width="100%" height="500" frameborder="1" allowfullscreen="true" style={{position:'relative'}}></iframe>
              </p>
            </Section>
          </main>
        </div>
      </Root>
    </>
  );
}
