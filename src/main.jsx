import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// ここでCSSを読み込む必要はありません（index.htmlで読み込んでいるため）

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)