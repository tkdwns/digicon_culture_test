import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import DetailPage from './pages/DetailPage';

// 기존 App
/*function App() {
  return (*/
    /* ⚠️ 최후의 수단: 환경 변수가 작동하지 않을 때는 
       저장소 이름 경로를 직접 문자열로 확실하게 지정해 줍니다! (앞에 슬래시 필수, 뒤에는 제외) */
    /*<BrowserRouter basename="/digicon_culture_test">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/detail/:id" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}*/

// src/App.jsx
function App() {
  return (
    /* 💡 이렇게 적어두면 로컬(dev)일 때는 알아서 공백으로, 
       깃허브 배포(deploy)일 때는 저장소 경로로 똑똑하게 작동합니다. */
    <BrowserRouter basename={import.meta.env.MODE === 'production' ? '/digicon_culture_test' : '/'}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/detail/:id" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;