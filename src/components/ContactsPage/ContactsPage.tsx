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
                <p style={{marginBottom: 8}}>ИНН: 9715431330</p>
                <p style={{marginBottom: 8}}>КПП: 771501001</p>
                <p style={{marginBottom: 8}}>ОГРН: 1227700703878</p>
                <p style={{marginBottom: 8}}>ОКПО: 84915489</p>
              </div>

              <p style={{marginBottom: 16}}>
                  Телефон: +7 (495) 241-23-56
              </p>
            

              <p style={{marginBottom: 16}}>
                <Button variant="outlined" startIcon={<TelegramIcon />} color="info" style={{marginRight: 12}} href='https://t.me/SocCoop_Moscow' target='_blank'>
                  Наш телеграм: @SocCoop_Moscow
                </Button>
              </p>

              <h4 id="delivery-map" style={{marginBottom: 8}}>Карта доставки</h4>

              <p style={{marginBottom:16}}>
                Если вы живете дальше — привлекайте друзей и знакомых. Если наберется хотя бы 3 человека в вашей локации, попробуем доставить и вам.
                Если вы живете на границе зоны, напишите или позвоните нам.
              </p>

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