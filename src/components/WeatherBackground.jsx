import React from 'react';
import './WeatherAnimations.css';

const WeatherBackground = ({ weather }) => {
  if (!weather) return <div className="weather-bg bg-day"></div>;

  const main = weather.weather[0].main;
  const windSpeed = weather.wind.speed;
  
  // 時間データ (UNIX秒)
  const now = weather.dt;
  const sunrise = weather.sys.sunrise;
  const sunset = weather.sys.sunset;
  
  const buffer = 3600; // 朝焼け・夕焼けのバッファ時間

  // ■ 昼夜・朝夕の判定
  let timePhase = 'day';
  if (now >= sunrise - buffer && now < sunrise + buffer) {
    timePhase = 'sunrise';
  } else if (now >= sunset - buffer && now < sunset + buffer) {
    timePhase = 'sunset';
  } else if (now >= sunrise && now < sunset) {
    timePhase = 'day';
  } else {
    timePhase = 'night';
  }

  // ■ 太陽の位置計算 (昼間 0% -> 100%)
  let sunProgress = 0;
  if (timePhase === 'day' || timePhase === 'sunrise' || timePhase === 'sunset') {
    if (now > sunrise && now < sunset) {
      sunProgress = (now - sunrise) / (sunset - sunrise);
    } else if (timePhase === 'sunset') {
      sunProgress = 1; 
    } else if (timePhase === 'sunrise') {
      sunProgress = 0;
    }
  }
  const sunX = 10 + (sunProgress * 80); 
  const sunY = 100 - (Math.sin(sunProgress * Math.PI) * 90);


  // ■ 月の位置計算 (夜間 0% -> 100%)
  // 日没(0%) -> 真夜中(50%) -> 日の出(100%)
  let moonProgress = 0.5; // デフォルトは真ん中

  if (timePhase === 'night' || timePhase === 'sunrise' || timePhase === 'sunset') {
    // パターンA: 日没後〜24時の間 (例: 20時) -> 今日のsunsetからスタート
    if (now >= sunset) {
       const nextSunrise = sunrise + 86400; // 翌日の日の出（仮）
       moonProgress = (now - sunset) / (nextSunrise - sunset);
    } 
    // パターンB: 0時〜日の出の間 (例: 4時) -> 昨日のsunsetからスタート
    else if (now < sunrise) {
       const prevSunset = sunset - 86400; // 前日の日没（仮）
       moonProgress = (now - prevSunset) / (sunrise - prevSunset);
    }
  }
  
  const moonX = 10 + (moonProgress * 80);
  const moonY = 100 - (Math.sin(moonProgress * Math.PI) * 90);


  // ■ 背景クラス決定
  let bgClass = 'bg-day';
  if (main === 'Rain' || main === 'Drizzle') bgClass = timePhase === 'night' ? 'bg-night' : 'bg-day';
  else if (main === 'Thunderstorm') bgClass = 'bg-thunder';
  else {
    switch(timePhase) {
      case 'sunrise': bgClass = 'bg-sunrise'; break;
      case 'sunset':  bgClass = 'bg-sunset'; break;
      case 'night':   bgClass = 'bg-night'; break;
      default:        bgClass = 'bg-day';
    }
  }

  // 曇りや雨の夜調整
  if ((main === 'Rain' || main === 'Clouds') && timePhase !== 'night') {
     // 昼間の雨天調整が必要ならここ
  }

  let elements = null;
  const cloudSpeedClass = windSpeed >= 10 ? 'cloud-fast' : '';

  // 太陽・月の表示フラグ
  // 晴れ(Clear)なら必ず出す。曇り(Clouds)でもチラ見せしたい場合はここを調整
  const showSun = (timePhase !== 'night' && main === 'Clear');
  const showMoon = (timePhase === 'night' && main === 'Clear');

  switch (main) {
    case 'Clear':
      elements = (
        <>
          {showSun && (
            <div 
              className="sun-css" 
              style={{ left: `${sunX}%`, top: `${sunY}%` }} 
            ></div>
          )}
          {showMoon && (
            <>
              <div className="star-layer"></div>
              <div 
                className="moon-css"
                // CSSの固定配置(right/top)を打ち消して動かす
                style={{ left: `${moonX}%`, top: `${moonY}%`, right: 'auto' }} 
              ></div>
            </>
          )}
          {/* 晴れの夜で月が出てない（曇りなど）場合でも星は出す */}
          {timePhase === 'night' && !showMoon && <div className="star-layer"></div>}
        </>
      );
      break;

    case 'Clouds':
      elements = (
        <>
          {timePhase === 'night' && <div className="star-layer" style={{ opacity: 0.3 }}></div>}
          <div className={`cloud-css cloud-1 ${cloudSpeedClass}`}></div>
          <div className={`cloud-css cloud-2 ${cloudSpeedClass}`}></div>
          <div className={`cloud-css cloud-3 ${cloudSpeedClass}`}></div>
        </>
      );
      break;

    case 'Rain':
    case 'Drizzle':
      elements = (
        <>
          <div className="rain-layer rain-back"></div>
          <div className="rain-layer rain-front"></div>
        </>
      );
      break;

    case 'Thunderstorm':
      elements = (
        <>
          <div className="rain-layer rain-back rain-fast"></div>
          <div className="rain-layer rain-front rain-fast"></div>
        </>
      );
      break;

    case 'Snow':
      elements = (
        <>
          <div className="snowflake snow-1"></div>
          <div className="snowflake snow-2"></div>
          <div className="snowflake snow-3"></div>
          <div className="snowflake snow-4"></div>
          <div className="snowflake snow-5"></div>
        </>
      );
      break;

    default:
      elements = null;
  }

  return (
    <div className={`weather-bg ${bgClass}`}>
      {elements}
    </div>
  );
};

export default WeatherBackground;