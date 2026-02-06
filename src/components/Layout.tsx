import { ReactNode } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Container,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';

interface LayoutProps {
  children: ReactNode;
  currentTab: number;
  onTabChange: (tab: number) => void;
}

export function Layout({ children, currentTab, onTabChange }: LayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <DescriptionIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Resume Customizer
          </Typography>
        </Toolbar>
        <Box sx={{ bgcolor: 'primary.dark' }}>
          <Container maxWidth="lg">
            <Tabs
              value={currentTab}
              onChange={(_, value) => onTabChange(value)}
              textColor="inherit"
              TabIndicatorProps={{ sx: { bgcolor: 'white', height: 3 } }}
            >
              <Tab label="My Resume" />
              <Tab label="Add Job" />
              <Tab label="Applications" />
            </Tabs>
          </Container>
        </Box>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
