import { useCallback } from 'react'
import { Typography } from '@mui/material'

import DateTimePicker from './DateTimePicker'
import { database } from '../firebase'
import { localizeDateExtended, locilizeDate, toCurrencyStringRu, toLocaleStringRu, useFirebaseState } from '../utils'

const resetAllCarts = () => {
  if (confirm(`Вы собираетесь очистить все корзины карзины всех пользователей, это действие невозможно отменить.\n\nВы уверены?`)) {
    if (confirm(`Пользователи будут недовольны что их корзины опустели, они старательно собирали их, это действие невозможно отменить!\n\nВы уверены?`)) {
      database.ref(`/carts`).set(null).catch(() => { })
    }
  }
}

const CurrentProcurement = ({ edit = false }) => {
  const [{
    startDate = 0,
    endDate = 0,
    deliveryDate = 0,
    minCartTotal
  }, set, update] = useFirebaseState('/currentProcurement', {})
  const setMinCartTotal = useCallback(e => update({ 'minCartTotal': +e.target.value }), [])
  const setStartDate = useCallback((v: number) => update({ 'startDate': v }), [])
  const setEndDate = useCallback((v: number) => update({ 'endDate': v }), [])
  const setDeliveryDate = useCallback((v: number) => update({ 'deliveryDate': v }), [])
  const now = Date.now()
  const upcoming = now < startDate
  const activeNow = !upcoming && now < endDate
  const incorrectDates = startDate >= endDate || deliveryDate <= endDate
  if (!endDate) return null
  return (
    <>
      <Typography variant="h6" style={{marginBottom: '1em'}}>
        {edit ? (
          <>
            <table style={{borderSpacing: '0 12px'}} id='schedule'>
              <tbody>
                <tr><td>
                  <p>Минимальная сумма закупки:</p>
                  <input value={minCartTotal} onChange={setMinCartTotal} size={11} /> ₽
                </td></tr>
                <tr><td>    
                  <DateTimePicker value={startDate} onChange={setStartDate} label="Начало закупки" />
                </td></tr>
                <tr><td>    
                  <DateTimePicker value={endDate} onChange={setEndDate} label="Окончание закупки" />
                </td></tr>
                <tr><td>    
                  <DateTimePicker value={deliveryDate} onChange={setDeliveryDate} label="Дата доставки" />
                </td></tr>
              </tbody>
            </table>
            {incorrectDates && <b style={{ color: 'red' }}>Некорректные даты: Дата окончания закупки раньше даты начала или дата доставки раньше даты окончания!</b>}
            <div><button onClick={resetAllCarts}>Очистить все корзины</button></div>
          </>
        ) : (
          <span>
            {activeNow ? (
              `Закупка продлится до ${locilizeDate(endDate)}`
            ) : (upcoming ? (
              `Следующая закупка начнётся ${locilizeDate(startDate)}`
            ) : (
              `Последняя закупка продлилась до ${toLocaleStringRu(endDate)}`
            ))}
            . <br/> Минимальная сумма закупки {toCurrencyStringRu(minCartTotal)}
          </span>
        )}
      </Typography>
      {!activeNow && <Typography variant="h6" style={{marginBottom: '1em'}}>
        Пожалуйста, обратите внимание, что к началу закупки цены в каталоге будут обновлены.
      </Typography>}
      <Typography variant="h6" style={{marginBottom: '1em'}}>
        <a href='/contacts#delivery-map' target='_blank'>Карта доставки</a>
      </Typography>
      {activeNow && <Typography variant="h6" style={{marginBottom: '1em'}}>
        {`Заказанные продукты будут доставлены вам ${localizeDateExtended(deliveryDate)}.`}
      </Typography>}
    </>
  )
}

export default CurrentProcurement