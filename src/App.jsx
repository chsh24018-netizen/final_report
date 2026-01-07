import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import About from './components/About'; // 新しいページ

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header />
        
        {/* ここで表示するページを切り替える */}
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/about" element={<About />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;