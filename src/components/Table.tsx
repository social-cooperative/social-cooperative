import styled from 'styled-components'

export const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  & td:not(:first-child) {
  }
  
  & td.image {
    width: 150px;
    height: 60px;
    position: relative;
  }

  
  & .category td {
    padding: 1em;
    background: #239F2328;
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
  width: 100%;
  height: 100%;
`

export default Table