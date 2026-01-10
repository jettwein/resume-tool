import { Box, Typography, Button, Card, CardContent } from '@mui/material'

function App() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: 4,
      }}
    >
      <Card sx={{ maxWidth: 500, borderRadius: 2 }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
            Agentic Coding Template
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Clone this repo to start building with Claude Code
          </Typography>
          <Button
            variant="contained"
            sx={{ borderRadius: 50 }}
            onClick={() => window.open('https://github.com/ripplcare/agentic-coding-poc', '_blank')}
          >
            View on GitHub
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default App
