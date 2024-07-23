import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ed6000', // 主色
    },
    secondary: {
      main: '#81cac4', // 辅助色
    },
    text: {
      primary: '#333333', // 主字体颜色
      secondary: '#666666', // 辅助字体颜色
    },
    background: {
      default: '#F2F2F2', // 背景颜色
      paper: '#f5f5f5', // 纸张背景颜色
    },
  },
  typography: {
    h4: {
      fontWeight: 'bold',
      color: '#333333',
    },
    body1: {
      lineHeight: 1.6,
      color: '#666666',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)', // 毛玻璃效果
          backgroundColor: 'rgba(255, 255, 255, 0.7)', // 透明背景色
        },
      },
    },
  },
});

export default theme;
