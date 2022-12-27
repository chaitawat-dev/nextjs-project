import { Box, Card as MuiCard, styled, Typography } from '@mui/material'
import React from 'react'

const Card = styled(MuiCard)(({ theme }) => ({
  padding: 20
}))

export default function index() {
  return (
    <Box>
      <Card>
        <Typography variant='h6'>Filters</Typography>
      </Card>
    </Box>
  )
}
