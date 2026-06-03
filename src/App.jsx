import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import DetailPage from './pages/DetailPage'; // 1. 상세페이지 가져오기

function App() {
  return (

    // 메인
    /*<BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/detail/:id" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>*/

     // 깃허브 업데이트 용
     <BrowserRouter basename="/digicon_culture_test">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/detail/:id" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;