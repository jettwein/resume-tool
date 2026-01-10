import { Box, Typography } from '@mui/material'
import { Button, Card } from 'rippl-shared-components'

function App() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 4,
      }}
    >
      <Card>
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
            Agentic Coding Template
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Clone this repo to start building with Claude Code
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.open('https://github.com/ripplcare/agentic-coding-poc', '_blank')}
          >
            View on GitHub
          </Button>
        </Box>
      </Card>
    </Box>
  )
}

export default App
