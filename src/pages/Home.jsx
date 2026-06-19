import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronLeft, ChevronRight, Search, BookOpen } from 'lucide-react';
import { INITIAL_STORIES } from '../data';

function Home() {
  const navigate = useNavigate();

  // 💡 백엔드 API로부터 받아온 동적 데이터를 관리할 상태 변수
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 검색 및 페이지네이션 상태 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ==========================================
  // 🔗 1. 백엔드 API fetch 통신 데이터 파이프라인
  // ==========================================
  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        // Notion 명세서 기준 메인 페이지 엔드포인트 호출
        const response = await fetch('/api/stories');
        if (!response.ok) {
          throw new Error('네트워크 응답에 문제가 발생했습니다.');
        }
        const data = await response.json();

        // 백엔드 출력값 예시 필드명 매핑 (description -> desc)
        const mappedData = data.map(story => ({
          ...story,
          desc: story.description, // 백엔드의 description 필드를 프론트엔드의 desc로 매핑
        }));

        setStories(mappedData);
      } catch (error) {
  console.error('백엔드 연결 실패 - 로컬 데이터를 로딩합니다:', error);
  // 💡 통신 실패 시 data.js의 데이터를 강제로 주입
  const mappedData = INITIAL_STORIES.map(story => ({
    ...story,
    desc: story.description || story.desc,
  }));
  setStories(mappedData);
} finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  // ==========================================
  // 🔍 2. 동적 데이터 기반 실시간 검색 필터링
  // ==========================================
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchTitle = story.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDesc = story.desc && story.desc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRegion = story.region && story.region.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTitle || matchDesc || matchRegion;
    });
  }, [stories, searchTerm]);

  // 검색어 변경 시 페이지를 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ==========================================
  // 📄 3. 페이지네이션 계산 구조
  // ==========================================
  const totalPages = Math.ceil(filteredStories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStories.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* --- 상단 영웅 구역 (Hero Section) --- */}
      <header style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        color: '#ffffff', padding: '80px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' 
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '700', inlineSize: 'fit-content', display: 'block', margin: '0 auto 20px' }}>
            문화체육관광 인공지능/데이터 공모전
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '16px', lineHeight: '1.2' }}>
            AI 로컬 문화 지도
          </h1>
          <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '36px', fontWeight: '400' }}>
            지역 소멸 위기를 겪는 도시의 숨겨진 문화 관광 가치와 역사적 서사를 발굴합니다.
          </p>

          {/* 통합 검색 바 */}
          <div style={{ position: 'relative', maxWidth: '550px', margin: '0 auto' }}>
            <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder=" 소제동, 한밭수목원, 부산 등 여행지나 지역을 검색해보세요... " 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '16px 20px 16px 52px', borderRadius: '14px', border: 'none', 
                fontSize: '16px', color: '#0f172a', backgroundColor: '#ffffff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', outline: 'none' 
              }}
            />
          </div>
        </div>
      </header>

      {/* --- 메인 콘텐츠 구역 --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        {/* 네비게이션 및 섹션 타이틀 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>발굴된 지역 문화 스토리</h2>
            <p style={{ fontSize: '14px', color: '#64748b' }}>AI가 생성한 깊이 있는 역사적 연도별 서사를 탐색해 보세요.</p>
          </div>
          <button 
            onClick={() => navigate('/map')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
              backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', 
              fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)', transition: 'all 0.2s' 
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
          >
            <MapPin size={16} /> 지도에서 보기
          </button>
        </div>

        {/* 💡 데이터 로딩 및 결과 대응 구조 */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b', fontSize: '16px' }}>
            백엔드 서버에서 소중한 문화 데이터를 불러오는 중입니다...
          </div>
        ) : currentItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
            검색 결과와 일치하는 문화 스토리가 존재하지 않습니다.
          </div>
        ) : (
          <>
            {/* 카드 그리드 뷰 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
              {currentItems.map((story) => (
                <article 
                  key={story.id}
                  style={{ 
                    backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                    border: '1px solid #flex', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, boxShadow 0.2s', cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/detail/${story.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                  }}
                >
                  {/* 카드 썸네일 및 태그 */}
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img 
                      src={story.imageUrl} 
                      alt={story.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '6px' }}>
                      <span style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        {story.region || '지역'}
                      </span>
                      <span style={{ backgroundColor: story.color || '#3b82f6', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        {story.category}
                      </span>
                    </div>
                  </div>

                  {/* 카드 본문 콘텐츠 */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '10px', lineHeight: '1.4' }}>
                        {story.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {story.desc}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '600', fontSize: '14px', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <BookOpen size={16} /> 스토리 탐색하기
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* 페이지네이션 컨트롤러 */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '50px' }}>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ 
                    padding: '10px', borderRadius: '50%', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', 
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center'
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                  {currentPage} / {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{ 
                    padding: '10px', borderRadius: '50%', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', 
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center'
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Home;