import { Link } from 'react-router-dom';
import { Container, Paper, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Divider, Chip, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import CodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';

function About() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4, pb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 4, 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(10px)' 
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <InfoIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
            このアプリについて
          </Typography>
        </Box>

        <Typography variant="body1" paragraph color="text.secondary">
          OpenWeatherMap APIを活用し、詳細な気象情報と予報を視覚的に提供するReactアプリケーションです。
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom fontWeight="bold">
          🚀 主な機能
        </Typography>
        <List dense>
          {[
            "都市名検索（日本語・英語対応）",
            "現在地周辺の天気取得 (Geolocation API)",
            "検索履歴の保存・削除機能 (最大5件)",
            "気温・湿度・気圧・風速の詳細表示",
            "空気質指数 (AQI / PM2.5) の表示",
            "気温に応じた服装アドバイス",
            "5日間の天気予報と気温推移グラフ (Recharts)",
            "Googleマップでの場所確認連携"
          ].map((text, index) => (
            <ListItem key={index}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
          <CodeIcon sx={{ mr: 1 }} /> 使用技術スタック
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {[
            "React", 
            "Vite", 
            "Material UI (v6)", 
            "Recharts", 
            "OpenWeatherMap API", 
            "React Router",
            "LocalStorage"
          ].map((tech) => (
            <Chip key={tech} label={tech} color="primary" variant="outlined" size="small" />
          ))}
        </Box>

        <Box sx={{ mt: 5, textAlign: "center" }}>
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            size="large"
            startIcon={<HomeIcon />}
            sx={{ 
              borderRadius: 2,
              px: 4,
              fontWeight: 'bold',
              boxShadow: 3
            }}
          >
            ホームに戻る
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default About;