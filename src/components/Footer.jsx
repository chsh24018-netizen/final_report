function Footer() {
  return (
    <footer style={{ marginTop: "30px", fontSize: "0.8rem", color: "#666", textAlign: "center" }}>
      
      {/* 課題要件：氏名と学籍番号、指定の文言 */}
      <p>日本大学文理学部情報科学科 Webプログラミングの演習課題</p>
      <p>学生証番号: 5424018 氏名: 吉永慎太郎</p>
      
      {/* 課題要件：他者の著作物（API）へのライセンス表記 */}
      <p style={{ marginTop: "10px" }}>
        Data provided by <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a>
      </p>
      
      <p>&copy; 2025 Weather Dashboard</p>
    </footer>
  );
}

export default Footer;