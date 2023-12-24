import { toCurrencyStringRu, useFirebaseState } from '../../utils';
import Root from '../AboutPage/AboutPage.style';

export default function MemoPage() {

  const [{ minCartTotal }] = useFirebaseState('/currentProcurement', {})

  return (
    <>
      <Root>
        <div className='main-page'>
          <main className='main-page-content'>
            <section className='page-section'>
              <article className='page-section-content'>
                <h2>Памятка по процессу закупки</h2>
                <ul>
                  <li>
                    Закупки обычно проходят раз в две недели: 
                    <ul style={{marginTop: '12px'}}>
                      <li>Открываются во вторник утром;</li>
                      <li>Закрываются в среду вечером;</li>
                      <li>Развоз заказов происходит в воскресенье.</li>
                    </ul>
                    Иногда даты проведения и развоза могут меняться, чаще всего из-за праздников. Уточняйте актуальные даты на <a href="/">главной странице</a>;
                  </li>
                  <li>
                    Объем закупки продукта увеличен до минимальной фасовки поставщика, что позволит обеспечить вас 
                    достаточным объемом товаров по низким ценам надолго;
                  </li>
                  <li>
                    Минимальная сумма заказа — {toCurrencyStringRu(minCartTotal)} ₽.
                  </li>
                </ul>
                <p>
                  Мы надеемся, что каждый из вас подберет себе продукты из нашего ассортимента, подходящие вам самым лучшим образом. 
                </p>
                <p>Будем рады любой обратной связи и приглашаем к активной совместной деятельности! </p>
                <p>Мы с удовольствием ответим на все вопросы и поможем вам найти место в наших рядах! </p>
                <p>Спасибо, что вы с нами! </p>
                <p><b>Команда ПК «СоцКооп»</b></p>
              </article>
              <aside className='page-section-aside'>
                <img
                  src='/aside-01.jpg'
                  alt='Давайте закупаться вместе!'
                  height='180'
                />
              </aside>
            </section>
          </main>
        </div>
      </Root>
    </>
  );
}
