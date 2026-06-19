import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Marker } from 'pigeon-maps';
import { Menu, X, Home, Filter, ChevronRight, Search } from 'lucide-react';
import { INITIAL_STORIES } from '../data';

// 💡 권역별 고유 테마 색상 정의 (기존 UI 유지)
const REGION_COLORS = {
  '서울특별시': '#ef4444', // 빨강
  '대전광역시': '#eab308', // 노랑
  '부산광역시': '#3b82f6', // 파랑
  '충청남도': '#10b981',   // 초록
  '강원도': '#8b5cf6',     // 보라
  '경기도': '#f97316',     // 주황
  '전체': '#64748b'
};

function MapPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 필터 및 검색 상태 관리
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [regionFilter, setRegionFilter] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);

  // 지도 상태 (초기 중심: 대한민국 중심부 / 초기 줌: 7.5)
  const [mapCenter, setMapCenter] = useState([36.25, 127.6]);
  const [mapZoom, setMapZoom] = useState(7.5);

  // 💡 백엔드 API로부터 받아온 동적 데이터를 누적 관리할 상태 변수
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // 🔗 1. 최초 로딩 시 메인 스토리 목록 호출 (GET /api/stories)
  // ==========================================
  useEffect(() => {
    const fetchInitialStories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/stories');
        if (!response.ok) throw new Error('네트워크 응답 오류');
        const data = await response.json();
        
        // 백엔드 description 필드를 프론트엔드의 desc로 매핑
        const mappedData = data.map(story => ({
          ...story,
          desc: story.description, 
        }));
        setPlaces(mappedData);
      } catch (error) {
  console.error("백엔드 초기 데이터 로딩 실패 - 로컬 데이터를 적용합니다:", error);
  // 💡 초기 로딩 실패 시 로컬 데이터를 매핑하여 주입
  const mappedData = INITIAL_STORIES.map(story => ({
    ...story,
    desc: story.description || story.desc,
  }));
  setPlaces(mappedData);
} finally {
        setIsLoading(false);
      }
    };
    fetchInitialStories();
  }, []);

  // ==========================================
  // 🔗 2. [신규 인터랙션] 특정 좌표 중심의 주변 추천 데이터 호출 함수
  // ==========================================
  const fetchRecommendations = async (lat, lng) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/recommendations?lat=${lat}&lng=${lng}`);
      
      // 💡 [방어코드] 응답이 정상이 아니고 형식이 JSON이 아니면 무조건 catch로 던짐
      if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
        throw new Error('정상적인 JSON 응답이 아닙니다.');
      }
      
      const data = await response.json();
      const mappedData = data.map(story => ({
        ...story,
        desc: story.description,
      }));

      // 정상 수급 시 중복 제거 후 병합
      setPlaces(prevPlaces => {
        const combined = [...prevPlaces, ...mappedData];
        return combined.filter((item, index, self) =>
          self.findIndex(t => t.id === item.id) === index
        );
      });
    } catch (error) {
      console.warn("백엔드 추천 API 연결 실패 - 로컬 데이터 기반 가상 추천을 수행합니다.");
      
      // 💡 위도/경도 오차가 ±0.5 이하인 로컬 데이터를 주변 추천 데이터로 가상 필터링
      const localRecs = INITIAL_STORIES.filter(story => 
        Math.abs(story.lat - lat) < 0.5 && Math.abs(story.lng - lng) < 0.5
      ).map(story => ({
        ...story,
        desc: story.description || story.desc
      }));

      // 💡 [해결 지점] 터지던 .values() 구조를 안전한 filter 구조로 전면 교체
      setPlaces(prevPlaces => {
        const combined = [...prevPlaces, ...localRecs];
        return combined.filter((item, index, self) =>
          self.findIndex(t => t.id === item.id) === index
        );
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🔍 3. 동적 데이터 기반 필터링 및 클러스터링
  // ==========================================
  const categories = useMemo(() => ['전체', ...new Set(places.map(s => s.category))], [places]);
  const regions = useMemo(() => ['전체', ...new Set(places.map(s => s.region || '기타'))], [places]);

  const filteredPlaces = useMemo(() => {
    return places.filter(p => {
      const matchCategory = categoryFilter === '전체' || p.category === categoryFilter;
      const matchRegion = regionFilter === '전체' || p.region === regionFilter;
      const pRegion = p.region || '';
      const matchSearch = searchQuery.trim() === '' || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pRegion.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchRegion && matchSearch;
    });
  }, [categoryFilter, regionFilter, searchQuery, places]);

  const clusters = useMemo(() => {
    if (mapZoom >= 9) return []; // 줌이 가까워지면 군집을 풀고 마커 노출
    const groups = {};
    filteredPlaces.forEach(p => {
      const reg = p.region || '기타';
      if (!groups[reg]) {
        groups[reg] = { region: reg, count: 0, latSum: 0, lngSum: 0, places: [] };
      }
      groups[reg].count += 1;
      groups[reg].latSum += p.lat;
      groups[reg].lngSum += p.lng;
      groups[reg].places.push(p);
    });
    return Object.values(groups).map(g => ({
      region: g.region,
      count: g.count,
      center: [g.latSum / g.count, g.lngSum / g.count],
      places: g.places
    }));
  }, [filteredPlaces, mapZoom]);

  // ==========================================
  // 🖱️ 4. 인터랙션 이벤트 핸들러 (백엔드 통신 트리거)
  // ==========================================
  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
    setIsSidebarOpen(true);
    setMapCenter([place.lat, place.lng]);
    setMapZoom(12);

    // 마커 클릭 시 해당 좌표 주변 추천 정보 실시간 동적 로딩
    fetchRecommendations(place.lat, place.lng);
  };

  const handleClusterClick = (cluster) => {
    const [lat, lng] = cluster.center;
    setMapCenter([lat, lng]);
    setMapZoom(11); 

    // 군집 클릭으로 지도 워프 시 해당 행정구역 중심 주변 추천 정보 동적 로딩
    fetchRecommendations(lat, lng);
  };

  // 지도 범위 및 줌 제한 핸들러 (대한민국 영역 이탈 방지)
  const handleBoundsChange = ({ center, zoom }) => {
    const  constrainedZoom = Math.max(7, Math.min(zoom, 18));
    if (constrainedZoom !== zoom) setMapZoom(constrainedZoom);
    const lat = Math.max(33.0, Math.min(center[0], 39.0));
    const lng = Math.max(124.0, Math.min(center[1], 132.0));
    if (lat !== center[0] || lng !== center[1]) {
      setMapCenter([lat, lng]);
    } else {
      setMapCenter(center);
      setMapZoom(zoom);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
      
      {/* --- 1. 대형 지도 메인화면 (pigeon-maps) --- */}
      <Map center={mapCenter} zoom={mapZoom} onBoundsChanged={handleBoundsChange}>
        {mapZoom < 9 ? (
          // 멀리서 볼 때: 군집 원형 레이아웃 출력
          clusters.map(cluster => (
            <Marker key={cluster.region} anchor={cluster.center}>
              <div 
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleClusterClick(cluster); 
                }}
                style={{
                  backgroundColor: REGION_COLORS[cluster.region] || '#64748b',
                  color: '#ffffff',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '11px',
                  border: '2px solid #ffffff',
                  transition: 'transform 0.15s ease',
                  position: 'relative',
                  zIndex: 999 
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
              >
                <div style={{ fontSize: '9px', opacity: 0.9, lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {cluster.region.substring(0, 2)}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '800', lineHeight: 1.1 }}>
                  {cluster.count}
                </div>
              </div>
            </Marker>
          ))
        ) : (
          // 가까이서 볼 때: 정밀 핀포인트 마커 출력 (지역 색상 자동 매핑)
          filteredPlaces.map(place => (
            <Marker 
              key={place.id} 
              anchor={[place.lat, place.lng]} 
              color={REGION_COLORS[place.region] || '#3b82f6'} 
              onClick={() => handleMarkerClick(place)}
            />
          ))
        )}
      </Map>

      {/* --- 2. 스마트 컨트롤 사이드바 --- */}
      <aside style={{ 
        position: 'absolute', top: 0, left: 0, width: '380px', height: '100%', 
        backgroundColor: '#ffffff', boxShadow: isSidebarOpen ? '4px 0 24px rgba(15, 23, 42, 0.15)' : 'none', 
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', 
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 10, display: 'flex', flexDirection: 'column' 
      }}>
        {/* 헤더 구역 */}
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="홈으로 이동">
              <Home size={20} />
            </button>
            <h1 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>로컬 문화 지도</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* 필터 및 검색 인프라 구역 */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#f8fafc' }}>
          {/* 검색창 */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
            <input type="text" placeholder="여행지 또는 지역 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff' }}
            />
          </div>
          
          {/* 지역 필터 */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={12} /> 지역 선택
            </div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              {regions.map(reg => (
                <button key={reg} onClick={() => setRegionFilter(reg)}
                  style={{
                    padding: '6px 12px', borderRadius: '20px', border: '1px solid',
                    borderColor: regionFilter === reg ? REGION_COLORS[reg] || '#3b82f6' : '#e2e8f0',
                    backgroundColor: regionFilter === reg ? REGION_COLORS[reg] || '#3b82f6' : '#ffffff',
                    color: regionFilter === reg ? '#ffffff' : '#475569', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* 테마 카테고리 필터 */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>테마 분류</div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '6px 12px', borderRadius: '20px', border: '1px solid',
                    borderColor: categoryFilter === cat ? '#0f172a' : '#e2e8f0',
                    backgroundColor: categoryFilter === cat ? '#0f172a' : '#ffffff',
                    color: categoryFilter === cat ? '#ffffff' : '#475569', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 결과 리스트 및 상세 카드 뷰 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '14px' }}>
              데이터를 동적으로 연결 중입니다...
            </div>
          ) : selectedPlace ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ backgroundColor: REGION_COLORS[selectedPlace.region] || '#3b82f6', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                  {selectedPlace.region} · {selectedPlace.category}
                </span>
                <button onClick={() => setSelectedPlace(null)} style={{ fontSize: '12px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  목록 보기
                </button>
              </div>
              <img src={selectedPlace.imageUrl} alt={selectedPlace.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>{selectedPlace.title}</h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>{selectedPlace.desc}</p>
              </div>
              <button onClick={() => navigate(`/detail/${selectedPlace.id}`)}
                style={{
                  width: '100%', padding: '14px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px',
                  fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
                }}
              >
                스토리 보러가기 <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>추천 관광지 목록 ({filteredPlaces.length}개)</div>
              {filteredPlaces.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '14px' }}>조건에 맞는 여행지가 없습니다.</div>
              ) : (
                filteredPlaces.map(place => (
                  <div key={place.id} onClick={() => {
                        setSelectedPlace(place);
                        setMapCenter([place.lat, place.lng]);
                        setMapZoom(12);
                        fetchRecommendations(place.lat, place.lng); // 리스트 아이템 클릭 시에도 주변 데이터 로딩
                      }}
                      style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: '#ffffff' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = REGION_COLORS[place.region] || '#cbd5e1';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                    <img src={place.imageUrl} alt={place.title} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{place.title}</h4>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{place.region}</span>
                        <span style={{ fontSize: '11px', color: '#cbd5e1' }}>|</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{place.category}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      {/* --- 3. 플로팅 사이드바 메뉴 열기 버튼 --- */}
      {!isSidebarOpen && (
        <button onClick={() => setIsSidebarOpen(true)}
          style={{ 
            position: 'absolute', top: '20px', left: '20px', zIndex: 5, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', 
            padding: '12px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title="메뉴 열기"
        >
          <Menu size={20} color="#0f172a" />
        </button>
      )}
    </div>
  );
}

export default MapPage;