import { log, toCurrencyStringRu, toLocaleStringRu, useFirebaseState } from '../utils'

import Typography from '@mui/material/Typography'
import InputDate from './InputDate'
import { useCallback } from 'react'
import { database } from '../firebase'

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
    minCartTotal
  }, set, update] = useFirebaseState('/currentProcurement', {})
  const setMinCartTotal = useCallback(e => update({ 'minCartTotal': +e.target.value }), [])
  const setStartDate = useCallback(v => update({ 'startDate': v }), [])
  const setEndDate = useCallback(v => update({ 'endDate': v }), [])
  const now = Date.now()
  const upcoming = now < startDate
  const activeNow = !upcoming && now < endDate
  const incorrect = startDate >= endDate
  if (!endDate) return null
  return (
    <Typography variant="h6" style={{marginBottom: '1em'}}>
      {edit ? (
        <>
          <table>
            <tbody>
              <tr><td>Минимальная сумма закупки:</td><td><input value={minCartTotal} onChange={setMinCartTotal} size={11} /> ₽</td></tr>
              <tr><td>Начало:</td><td><InputDate value={startDate} onChnage={setStartDate} /></td></tr>
              <tr><td>Окончание:</td><td><InputDate value={endDate} onChnage={setEndDate} /></td></tr>
            </tbody>
          </table>
          {incorrect && <b style={{ color: 'red' }}>Дата окончания закупки раньше даты начала!</b>}
          <div><button onClick={resetAllCarts}>Очистить все корзины</button></div>
        </>
      ) : (
        <span>
          {activeNow ? (
            `Закупка продлится до ${toLocaleStringRu(endDate)}`
          ) : (upcoming ? (
            `Следующая закупка начнётся ${toLocaleStringRu(startDate)}`
          ) : (
            `Последняя закупка была ${toLocaleStringRu(endDate)}`
          ))}
          , минимальная сумма закупки {toCurrencyStringRu(minCartTotal)}
        </span>
      )}
    </Typography>
  )
}

export default CurrentProcurement