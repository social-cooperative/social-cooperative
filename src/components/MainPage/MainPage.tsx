import { CircularProgress } from '@mui/material';

import { locilizeDate, useFirebaseState } from '../../utils';
import Root from './MainPage.style';

const now = Date.now();
const previewConfig = {
  title: 'Новая совместная закупка уже скоро!',
  subtitle: 'Дата пока не назначена, следите за обновлениями в телеграм-канале',
  date: null as string | null,
};

export default function MainPage() {
  const [{ startDate = 0, endDate = 0 }] = useFirebaseState('/currentProcurement', {});

  if (now < startDate) {
    previewConfig.subtitle = 'Дата начала:'
    previewConfig.date = locilizeDate(startDate);
  } else if (now < endDate) {
    previewConfig.title = 'Совместная закупка уже идёт!'
    previewConfig.subtitle = 'Дата окончания:'
    previewConfig.date = locilizeDate(endDate);
  } 

  return (
    <>
      <Root>
        <div className='main-page'>
          <header className='header'>
            <img src='/logo.svg' alt='' height='37' />
          </header>
          <section className='preview'>
            {startDate === 0 && 
              <div className='preview-overlay'>
                <CircularProgress color="inherit" />
              </div>
            }
            <div className='preview-container'>
              <h1 className='preview-heading'>
                {previewConfig.title}
              </h1>
              <p>
                {previewConfig.subtitle}
              </p>
              {previewConfig.date && 
                <h2 className='preview-subheading'>
                  {previewConfig.date}
                </h2>
              }
              <a className='preview-button' href='/store'>Каталог</a>
            </div>
          </section>
          <main className='main-page-content'>
            <section className='page-section'>
              <article className='page-section-content'>
                <h2>Что такое СоцКооп</h2>
                <p>
                  Потребительский кооператив – это объединение людей, созданное
                  для борьбы с дороговизной путём совместной закупки товаров.
                  Участники кооператива становятся пайщиками.
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
                  Пайщики помогают в выборе поставщиков, товаров, в оценке
                  качества, участвуют в работе ревизионной комиссии и другой
                  кооперативной деятельности.
                </p>
                <p>
                  Мы приглашаем к участию всех, для кого товары в магазинах
                  стали слишком дорогими. Совместная закупка позволяет
                  приобретать товары на 15 – 50% дешевле.
                </p>
              </article>
            </section>
            <section className='page-section'>
              <article className='page-section-content'>
                <h2>Как это работает</h2>
                <p>
                  Достигается это прямой работой с производителями и крупными
                  оптовыми поставщиками, а также специальным налоговым режимом
                  для потребительских кооперативов. Но главное – активным
                  участием пайщиков.
                </p>
                <p>
                  Когда вы убедитесь в выгодности совместных закупок, пригласите
                  в кооператив друзей, соседей, коллег по работе! Чем больше
                  людей будет покупать совместно, тем больше будут объёмы
                  закупки, и тем более выгодные условия можно будет получить у
                  поставщиков.
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
                  Участие в потребительском кооперативе не накладывает на
                  пайщиков никаких скрытых обязательств. Нет никаких
                  периодических или обязательных платежей.
                </p>

                <p>
                  Личная информация защищается в соответствии с Законом 152-ФЗ
                  “О защите персональных данных”. Платежи проходят напрямую на
                  расчётный счёт кооператива и защищены технологиями банковской
                  безопасности.
                </p>

                <p>
                  Каждому пайщику доступна информация о движении средств на его
                  паевом счету. Пайщики вправе получать информацию о
                  расходовании средств кооператива в целом.
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
                  Мы хотим разрушить монополию корпораций на поставки
                  продовольствия и важнейших товаров нашим семьям. Мы хотим
                  привнести в жизнь всех участников радость общего дела.
                </p>
                <p>
                  Присоединяйтесь к ближайшей закупке, пишите в наш чат,
                  расскажите о нас вашим друзьям и близким!
                </p>
                <p>
                  Наш сайт <a href='/store' target='_blank'>СОЦКООП.РФ</a>
                </p>
              </article>
              <aside className='page-section-aside'>
                <article className='qr-item'>
                  <img
                    className='qr-item-code'
                    src='/qr-aside-01.svg'
                    alt='Информационный телеграм-канал СоцКооп'
                  />
                  <p className='qr-item-label'>
                    Информационный телеграм-канал.&nbsp;
                    <a href='https://t.me/+8DFjKvDrZR41ZGIy' target='_blank'>
                      Прямая ссылка
                    </a>
                  </p>
                </article>
              </aside>
            </section>
          </main>
          <footer className='main-page-footer'>ПК "СоцКооп" | 2022</footer>
        </div>
      </Root>
    </>
  );
}
