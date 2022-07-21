import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import styled from 'styled-components'

import { auth, database } from '../firebase'

export const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  & td:not(:first-child) {
    //border-left: 1px solid #888888;
  }
  
  & td.image {
    width: 150px;
    height: 60px;
    position: relative;
  }

  
  & .category td {
    padding: 1em;
    background: #cccccc;
    text-align: center;
  }
  
  & .category.no-center td {
    text-align: initial;
  }

  & .product td {
    padding: 5px;
  }

`

export const CellImg = styled.img`
  display: block;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

export default Table