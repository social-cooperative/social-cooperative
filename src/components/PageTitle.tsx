import { styled, Typography } from "@mui/material"

const Title = styled(Typography)`
  padding: 0.3em 0;
  border-bottom: 2px solid #36BA5F;
  margin-bottom: 0.5em;
`

export default ({ children, ...rest }) => <Title variant="h4" {...rest}>{children}</Title>