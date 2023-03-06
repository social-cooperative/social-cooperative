import { memo } from 'react'
import styled from 'styled-components'

const SlotsRoot = styled.div`
  display: flex;
`

const SlotGreen = styled.div`
  min-height: 1em;
  flex: 1;
  margin: 0.1em;
  background: rgb(35, 159, 35);
  border: 1px solid rgb(35, 159, 35);
  color: white;
  text-align: center;
`

const SlotWhite = styled.div`
  height: 1em;
  flex: 1;
  margin: 0.1em;
  border: 1px solid rgb(35, 159, 35);
`

const SlotGray = styled.div`  
  min-height: 1em;
  flex: 1;
  margin: 0.1em;
  background: gray;
  border: 1px solid gray;
  color: white;
  text-align: center;
`

const SlotWhiteGray = styled.div`
  height: 1em;
  flex: 1;
  margin: 0.1em;
  border: 1px solid gray;
`

const Right = styled.div`
  text-align: center;
  margin-bottom: 0.5em;
`


const komplektov = n => {
  const two = n % 100
  if (two >= 11 && two <= 19)
    return `Набрано ${n} комплектов`
  const one = n % 10
  if (one === 1)
    return `Набран ${n} комплект`
  else if (one >= 2 && one <= 4)
    return `Набрано ${n} комплекта`
  else
    return `Набрано ${n} комплектов`
}



const SlotsPure = ({ slots = 0, leftover = 0, picked = 0 }) => {
  if (!slots && !leftover) return null

  const pickedFromLeftover = picked > leftover ? leftover : picked
  const pickedFromSlots = picked - pickedFromLeftover

  const grays = pickedFromLeftover || 0
  const whiteGrays = leftover - pickedFromLeftover || 0

  const green = pickedFromSlots % slots || 0
  const white = slots - green || 0
  const full = Math.floor(pickedFromSlots / slots) || 0

  return <>
    {(!!leftover && leftover > picked) &&
      <>
        <SlotsRoot>
          {Array(grays).fill(null).map((_, i) => <SlotGray key={i} />)}
          {Array(whiteGrays).fill(null).map((_, i) => <SlotWhiteGray key={i} />)}
        </SlotsRoot>
        <Right>Осталось докупить {whiteGrays} шт. из остатков</Right>
      </>
    }
    {!!slots && <>
      {!!full &&
        <SlotsRoot>
          <SlotGreen>{komplektov(full)}</SlotGreen>
        </SlotsRoot>
      }
      <SlotsRoot>
        {Array(green).fill(null).map((_, i) => <SlotGreen key={i} />)}
        {Array(white).fill(null).map((_, i) => <SlotWhite key={i} />)}
      </SlotsRoot>
      <Right>Осталось докупить {white} шт.</Right>
    </>}
  </>
}

export const Slots = memo(SlotsPure)