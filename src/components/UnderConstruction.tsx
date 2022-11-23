import styled from 'styled-components'
import Typography from '@mui/material/Typography'

const ShiedRoot = styled.div`
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
`

const ShiedInner = styled.div`
  text-align: center;
  position: relative;
`

const ShiedLogo = styled.img`
  display: block;
  width: 550px;
  margin: 0 auto;
`

export default function UnderConstruction() {
  return <>

    <ShiedRoot>
      <ShiedInner>
        <ShiedLogo src="under-construction.jpg" />
        <div>
          <Typography variant="h4" style={{ fontFamily: '"Journal Sans New", Roboto', marginBottom: '0.3em' }}>
            <img style={{ height: '0.8em', marginRight: '0.3em' }} src="logo.jpg" />
            СоцКооп
          </Typography>
          <Typography variant="button">Сайт в разработке</Typography>
        </div>
      </ShiedInner>
    </ShiedRoot>
  </>
}