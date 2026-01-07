import { useState, useEffect } from 'react';
import { Container, TextField, Button, Card, CardContent, Typography, Box, Grid, Paper, Chip, Alert, IconButton, InputAdornment, Tooltip, Skeleton } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ClearIcon from '@mui/icons-material/Clear';
import HistoryIcon from '@mui/icons-material/History';
import AirIcon from '@mui/icons-material/Air';
import CompressIcon from '@mui/icons-material/Compress';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import MaskIcon from '@mui/icons-material/Masks';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import WeatherBackground from './WeatherBackground';

function Main() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localTime, setLocalTime] = useState("");
  const [history, setHistory] = useState([]);

  const API_KEY = "6b74bbaf4bce337b746fe35f546e781e"; 
  const BASE_URL = "https://api.openweathermap.org/data/2.5";

  useEffect(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem("searchHistory"));
      if (Array.isArray(savedHistory)) {
        setHistory(savedHistory);
      }
    } catch (e) {
      console.error("履歴読み込みエラー", e);
    }

    const savedCity = localStorage.getItem("lastCity");
    if (savedCity) {
      setCity(savedCity);
      fetchWeather(savedCity);
    }
    document.body.style.background = 'transparent';
  }, []);

  const saveToHistory = (cityName) => {
    let newHistory = [cityName, ...history.filter(h => h !== cityName)];
    if (newHistory.length > 5) newHistory = newHistory.slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const deleteHistory = (cityName) => {
    const newHistory = history.filter(h => h !== cityName);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const calcLocalTime = (timezoneOffset) => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const localDate = new Date(utc + (timezoneOffset * 1000));
    return localDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (txt) => {
    const date = new Date(txt);
    return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });
  };

  const getAdvice = (temp, weatherMain) => {
    let clothing = "";
    let item = "";
    if (temp >= 25) clothing = "半袖で快適に過ごせます👕";
    else if (temp >= 20) clothing = "長袖シャツがちょうど良いですね👔";
    else if (temp >= 15) clothing = "カーディガンやパーカーがあると安心🧥";
    else if (temp >= 10) clothing = "コートやジャケットが必要です🧥";
    else clothing = "ダウンコートとマフラーで防寒を🧣";

    if (weatherMain === 'Rain' || weatherMain === 'Drizzle' || weatherMain === 'Thunderstorm') {
      item = "雨具を忘れずにお持ちください☔";
    }
    return { clothing, item };
  };

  const getAqiStatus = (index) => {
    switch(index) {
      case 1: return { text: "とても良い", color: "#4caf50" };
      case 2: return { text: "良い", color: "#8bc34a" };
      case 3: return { text: "普通", color: "#ffc107" };
      case 4: return { text: "悪い", color: "#ff9800" };
      case 5: return { text: "とても悪い", color: "#f44336" };
      default: return { text: "不明", color: "#9e9e9e" };
    }
  };

  const openGoogleMaps = () => {
    if (weather && weather.coord) {
      const url = `https://www.google.com/maps/search/?api=1&query=${weather.coord.lat},${weather.coord.lon}`;
      window.open(url, '_blank');
    }
  };

  const clearInput = () => {
    setCity("");
  };

  const fetchWeather = async (cityParam) => {
    const searchCity = typeof cityParam === "string" ? cityParam : city;
    if (searchCity === "") return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 500)); 

    try {
      const weatherRes = await fetch(`${BASE_URL}/weather?q=${encodeURIComponent(searchCity)}&units=metric&lang=ja&appid=${API_KEY}`);
      
      if (!weatherRes.ok) {
        throw new Error(`Server Error: ${weatherRes.status}`);
      }

      const weatherData = await weatherRes.json();

      if (!weatherData.cod || weatherData.cod === 200) {
        saveToHistory(searchCity);
        weatherData.name = searchCity; 
        setWeather(weatherData);
        setLocalTime(calcLocalTime(weatherData.timezone));
        localStorage.setItem("lastCity", searchCity);

        const lat = weatherData.coord.lat;
        const lon = weatherData.coord.lon;

        const forecastRes = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${API_KEY}`);
        if (forecastRes.ok) {
           const forecastData = await forecastRes.json();
           const dailyData = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));
           setForecast(dailyData);
        }

        const airRes = await fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        if (airRes.ok) {
           const airData = await airRes.json();
           if(airData.list) setAqi(airData.list[0]);
        }

      } else {
        alert("都市が見つかりません！");
        setWeather(null);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("データの取得に失敗しました。\n通信環境やAPIキーを確認してください。");
    }
    setLoading(false);
  };

  const fetchByLocation = () => {
    if (!navigator.geolocation) {
      alert("対応していません");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const weatherRes = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${API_KEY}`);
          if (!weatherRes.ok) throw new Error("Server Error");
          const weatherData = await weatherRes.json();
          
          if (weatherRes.ok) {
            saveToHistory(weatherData.name);
            setWeather(weatherData);
            setLocalTime(calcLocalTime(weatherData.timezone));
            setCity(weatherData.name);
            localStorage.setItem("lastCity", weatherData.name);

            const forecastRes = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${API_KEY}`);
            if(forecastRes.ok) {
                const forecastData = await forecastRes.json();
                const dailyData = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));
                setForecast(dailyData);
            }

            const airRes = await fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
            if(airRes.ok) {
                const airData = await airRes.json();
                if(airData.list) setAqi(airData.list[0]);
            }
          }
        } catch (error) {
          alert("現在地の天気が取得できませんでした。");
        }
        setLoading(false);
      },
      (error) => {
        alert("位置情報の取得に失敗しました");
        setLoading(false);
      }
    );
  };

  const chartData = forecast.map(item => ({
    name: formatDate(item.dt_txt),
    気温: Math.round(item.main.temp)
  }));

  const advice = weather ? getAdvice(weather.main.temp, weather.weather[0].main) : { clothing: "", item: "" };
  const aqiStatus = aqi ? getAqiStatus(aqi.main.aqi) : { text: "-", color: "#ccc" };

  const LoadingSkeleton = () => (
    <Card sx={{ minWidth: 275, boxShadow: 6, borderRadius: 4, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', mb: 4, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={100} height={100} animation="wave" />
      </Box>
      <Skeleton variant="text" width="60%" height={60} sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton variant="text" width="40%" height={30} sx={{ mx: 'auto', mb: 3 }} />
      <Grid container spacing={2}>
         {[1,2,3,4].map((i) => (
           <Grid key={i} size={6}><Skeleton variant="rounded" height={80} /></Grid>
         ))}
      </Grid>
    </Card>
  );

  return (
    <>
      <WeatherBackground weather={weather} />

      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center', pb: 8, position: 'relative', zIndex: 1 }}>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, ml: 1, textAlign: 'left', color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            都市名
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <TextField 
              fullWidth 
              placeholder="例: Tokyo または 東京"
              variant="outlined"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === "Enter") {
                  if (e.nativeEvent.isComposing) return;
                  fetchWeather();
                }
              }}
              InputProps={{
                endAdornment: city && (
                  <InputAdornment position="end">
                    <IconButton onClick={clearInput} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.9)' }, borderRadius: 1 }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={() => fetchWeather()}
              sx={{ fontWeight: 'bold', minWidth: '80px', height: '56px' }}
            >
              <SearchIcon />
            </Button>
          </Box>

          {history.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, justifyContent: 'flex-start' }}>
              <Box display="flex" alignItems="center" mr={1}>
                <HistoryIcon sx={{ color: '#fff', opacity: 0.9 }} fontSize="small" />
              </Box>
              {history.map((h, index) => (
                <Chip
                  key={index}
                  label={h}
                  onClick={() => { setCity(h); fetchWeather(h); }}
                  onDelete={(e) => deleteHistory(h)}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.85)', 
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: 'white' }
                  }}
                />
              ))}
            </Box>
          )}

          <Button
            variant="contained"
            onClick={fetchByLocation}
            startIcon={<LocationOnIcon />}
            sx={{ 
              fontWeight: 'bold', 
              backgroundColor: '#4caf50', 
              '&:hover': { backgroundColor: '#388e3c' }, 
              width: '100%',
              py: 1.5,
              borderRadius: 2
            }}
          >
            現在地周辺の天気を探す
          </Button>

        </Box>

        {loading ? (
          <LoadingSkeleton />
        ) : weather ? (
          <>
            <Card sx={{ minWidth: 275, boxShadow: 6, borderRadius: 4, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', mb: 4 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#333' }}>
                        {weather.name}
                      </Typography>
                      <Box display="flex" alignItems="center" sx={{ mt: 1, color: '#555' }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                           {localTime}
                        </Typography>
                      </Box>
                  </Box>
                  
                  <Tooltip title="Googleマップで場所を見る">
                    <IconButton onClick={openGoogleMaps} sx={{ bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}>
                      <MapIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 2, mt: 2 }}>
                  <img 
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
                    alt="icon"
                    style={{ width: 120, height: 120 }}
                  />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: '#ff8c00' }}>
                      {Math.round(weather.main.temp)}°C
                    </Typography>
                    <Typography variant="h5" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {weather.weather[0].description}
                    </Typography>
                  </Box>
                </Box>

                <Alert icon={<CheckroomIcon fontSize="inherit" />} severity="info" sx={{ mb: 2, textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>
                  {advice.clothing}
                </Alert>
                {advice.item && (
                  <Alert icon={<UmbrellaIcon fontSize="inherit" />} severity="warning" sx={{ mb: 2, textAlign: 'left', fontWeight: 'bold', backgroundColor: '#fff3e0' }}>
                    {advice.item}
                  </Alert>
                )}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {aqi && (
                    <Grid size={12}>
                        <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'rgba(232, 245, 233, 0.8)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MaskIcon sx={{ mr: 1, color: aqiStatus.color }} />
                          <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>
                              空気の状態: 
                          </Typography>
                          <Chip label={aqiStatus.text} sx={{ bgcolor: aqiStatus.color, color: 'white', fontWeight: 'bold' }} />
                          <Typography variant="caption" sx={{ ml: 1, color: '#666' }}>
                              (PM2.5: {aqi.components.pm2_5})
                          </Typography>
                        </Paper>
                    </Grid>
                  )}
                  <Grid size={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(245, 245, 245, 0.8)', borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                        <ThermostatIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">体感温度</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold">{Math.round(weather.main.feels_like)}°C</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(245, 245, 245, 0.8)', borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                        <Typography variant="caption" color="text.secondary">湿度</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold">{weather.main.humidity}%</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(245, 245, 245, 0.8)', borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                        <AirIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">風速</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold">{weather.wind.speed} m/s</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(245, 245, 245, 0.8)', borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                        <CompressIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">気圧</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold">{weather.main.pressure} hPa</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={12}>
                    <Paper elevation={0} sx={{ p: 1, bgcolor: 'rgba(227, 242, 253, 0.8)', borderRadius: 2, display: 'flex', justifyContent: 'space-around' }}>
                      <Box display="flex" alignItems="center">
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: '#ff9800' }} />
                        <Typography variant="body2">日の出: {formatTime(weather.sys.sunrise)}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: '#3f51b5' }} />
                        <Typography variant="body2">日没: {formatTime(weather.sys.sunset)}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {forecast.length > 0 && (
              <Box>
                 <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
                    <Box display="flex" alignItems="center" mb={2} justifyContent="center">
                      <ShowChartIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold" color="#333">気温推移グラフ</Typography>
                    </Box>
                    
                    {/* ★修正ポイント: heightを250（ピクセル）に固定しました。これでエラーは確実に出ません */}
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={12} />
                          <YAxis unit="°C" fontSize={12} />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="気温" stroke="#ff8c00" strokeWidth={3} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>

                 </Paper>

                <Box display="flex" alignItems="center" mb={2} justifyContent="center">
                  <CalendarMonthIcon sx={{ mr: 1, color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                    週間予報
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  {forecast.map((item, index) => (
                    <Paper 
                      key={index}
                      elevation={3} 
                      sx={{ 
                        p: 1, 
                        flex: 1,
                        borderRadius: 2, 
                        bgcolor: 'rgba(255,255,255,0.85)', 
                        backdropFilter: 'blur(10px)',
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        minWidth: 0
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold" noWrap>
                        {formatDate(item.dt_txt)}
                      </Typography>
                      <img 
                        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} 
                        alt="icon" 
                        style={{ width: 40, height: 40 }}
                      />
                      <Typography variant="body2" fontWeight="bold" color="#ff8c00">
                        {Math.round(item.main.temp)}°C
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }} noWrap>
                        {item.weather[0].description}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="h6" sx={{ mt: 4, color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            <WbSunnyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            都市名を入力して検索ボタン、または現在地ボタンを押してください
          </Typography>
        )}
      </Container>
    </>
  );
}

export default Main;