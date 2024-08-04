import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import IconButton from '@mui/material/IconButton'

import { locilizeDate, useFirebaseState } from '../../utils';
import Root from './AboutPage.style';

const now = Date.now();
const previewConfig = {
  title: 'Новая совместная закупка уже скоро!',
  subtitle: 'Дата пока не назначена, следите за обновлениями в телеграм-канале',
  date: null as string | null,
};

export default function AboutPage() {
  const [{ startDate = 0, endDate = 0 }] = useFirebaseState(
    '/currentProcurement',
    {}
  );

  const procurementIsReady = now > startDate && now < endDate;

  if (now < startDate) {
    previewConfig.subtitle = 'Дата начала:';
    previewConfig.date = locilizeDate(startDate);
  } else if (now < endDate) {
    previewConfig.title = 'Совместная закупка уже идёт!';
    previewConfig.subtitle = 'Дата окончания:';
    previewConfig.date = locilizeDate(endDate);
  }

  return (
    <>
      <Root>
        <div className='main-page'>
          <main className='main-page-content'>
            <section className='page-section'>
              <article className='page-section-content'>
                <h2>Что такое СоцКооп</h2>
                <IconButton href="/Устав_ПК_СоцКооп.pdf" color="primary" title="Посмотреть в браузере Устав Потребительского кооператива «СоцКооп»" target='_blank'>
                  <InsertDriveFileIcon /> <span  style={{ marginLeft: '8px', fontSize: '16px' }}>Посмотреть Устав в браузере</span>
                </IconButton>
                <IconButton download={true} href="/Устав_ПК_СоцКооп.pdf" color="primary" title="Скачать Устав Потребительского кооператива «СоцКооп» в формате PDF">
                  <PictureAsPdfIcon /> <span  style={{ marginLeft: '8px', marginBottom: '10px', fontSize: '16px' }}>Скачать Устав в формате PDF</span>
                </IconButton>
                <p>
                  Потребительский кооператив – это объединение людей, созданное
                  для удовлетворения их потребностей в качественных продуктах по
                  справедливой цене. Мы боремся с дороговизной путём совместной
                  закупки продуктов.
                </p>

                <p>
                  Участники кооператива становятся пайщиками, совладельцами
                  потребительского кооператива.
                </p>

                <p>
                  У нашего кооператива нет другого собственника, кроме самих
                  пайщиков, нет никого, кто присвоил бы себе доход. Доход нашего
                  кооператива идёт на развитие тех направлений деятельности,
                  которые одобрят сами пайщики.
                </p>
              </article>
              <aside className='page-section-aside'>
                <img
                  src='/aside-01.jpg'
                  alt='Давайте закупаться вместе!'
                  height='180'
                />
              </aside>
            </section>
            <section className='page-section'>
              <article className='page-section-content'>
                <h2>Наши принципы</h2>
                <p>
                  Кооператив построен на принципах горизонтальной экономической
                  структуры, вовлекает пайщиков в работу и обеспечивает
                  прозрачность всех её этапов. 
                </p>
                
                <p>
                  Пайщики помогают в выборе
                  поставщиков, продуктов, в оценке качества, участвуют в работе
                  ревизионной комиссии и другой кооперативной деятельности. 
                </p>
                
                <p>
                  Продукты
                  в нашем каталоге могут быть дешевле, чем в магазине у дома, а
                  иногда нет. Но пайщики выбирают всегда лучшее качество для
                  совместной закупки.
                </p>
              </article>
            </section>
            <section className='page-section'>
              <article className='page-section-content'>
                <h2>Как это работает</h2>
                <p>
                  Достигается это прямой работой с производителями и крупными оптовыми поставщиками, а также специальным налоговым режимом для потребительских кооперативов. Но главное – активным участием пайщиков. 
                </p>
                <p>
                  Когда вы убедитесь в выгодности совместных закупок, пригласите в кооператив друзей, соседей, коллег по работе! Чем больше людей будет покупать совместно, тем больше будут объёмы закупки, и тем более выгодные условия можно будет получить у поставщиков. 
                </p>
              </article>
              <aside className='page-section-aside'>
                <img src='/aside-02.jpg' alt='Давайте закупаться вместе!' />
              </aside>
            </section>
            <section className='page-section'>
              <article className='page-section-content'>
                <h2>Это безопасно</h2>
                <p>
                  Участие в потребительском кооперативе не накладывает на пайщиков никаких скрытых обязательств. Нет никаких периодических или обязательных платежей. Личная информация защищается в соответствии с Законом 152-ФЗ «О защите персональных данных».
                </p>
                <p>
                  Платежи проходят напрямую на расчётный счёт кооператива и защищены технологиями банковской безопасности. Каждому пайщику доступна информация о движении средств на его паевом счету. Пайщики вправе получать информацию о расходовании средств кооператива в целом.
                </p>
                <p>
                  Подробно об уставе и других нормативных документах вы можете узнать в телеграм-боте ниже. 
                </p>
              </article>
              <aside className='page-section-aside'>
                <img src='/aside-03.jpg' alt='Привет, это СоцКооп!' />
              </aside>
            </section>
            <section className='page-section'>
              <article className='page-section-content'>
                <h2>Планы на будущее</h2>
                <p>
                Мы хотим разрушить монополию корпораций на поставки продовольствия и важнейших продуктов нашим семьям. Мы хотим привнести в жизнь всех участников радость общего дела.
                </p>
                <p>
                  Присоединяйтесь к ближайшей закупке, пишите в наш чат, расскажите о нас вашим друзьям и близким!
                </p>
              </article>
            </section>
          </main>
        </div>
      </Root>
    </>
  );
}
