import { Link } from 'react-router-dom'; // リンク機能を使う

function Header() {
  return (
    <header style={{ marginBottom: "20px" }}>
      <h1>☁️ Weather Dashboard ☀</h1>
      
      {/* ナビゲーションメニュー */}
      <nav style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        <Link to="/" style={{ color: "#333", fontWeight: "bold" }}>Home</Link>
        <Link to="/about" style={{ color: "#333", fontWeight: "bold" }}>About</Link>
      </nav>
    </header>
  );
}

export default Header;