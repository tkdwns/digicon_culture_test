import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, MapPin, Calendar, Bookmark, Clock } from 'lucide-react';
import { INITIAL_STORIES } from '../data'; // 💡 상단 import 확인
import styles from './DetailPage.module.css';

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // 🔗 백엔드 상세 조회 API fetch 통신 (GET /api/stories/{id})
  // ==========================================
  useEffect(() => {
    const fetchStoryDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/stories/${id}`);
        if (!response.ok) {
          throw new Error('상세 데이터를 가져오는 데 실패했습니다.');
        }
        const data = await response.json();
        setStory({
          ...data,
          desc: data.description,
        });
      } catch (error) {
        console.error('백엔드 상세 조회 실패 - 로컬 데이터에서 검색합니다:', error);
        
        // 💡 [해결 지점] URL의 id와 로컬 데이터의 id 타입을 Number로 통일하여 검색
        const localStory = INITIAL_STORIES.find(item => Number(item.id) === Number(id));
        if (localStory) {
          setStory({
            ...localStory,
            desc: localStory.description || localStory.desc
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchStoryDetail();
    }
  }, [id]);

  // 💡 [핵심 방어선 1] 로딩 중일 때는 하단의 story.color 등을 읽지 못하게 차단
  if (isLoading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>
        <h2>역사적 서사 데이터를 불러오는 중입니다...</h2>
      </div>
    );
  }

  // 💡 [핵심 방어선 2] 데이터 로딩이 끝났음에도 스토리가 없을 때 차단
  if (!story) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>존재하지 않는 스토리입니다.</h2>
        <button onClick={() => navigate('/')} style={{ marginTop: '16px', padding: '10px 20px', cursor: 'pointer' }}>
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  // 💡 위의 두 방어선 덕분에 이 아래부터는 안심하고 story.color, story.category 등을 사용할 수 있습니다.
  return (
    <div className={styles.container}>
      {/* --- 1. 상단 내비게이션 바 --- */}
      <header className={styles.header}>
        <div className={styles.navGroup}>
          <button className={styles.navBtn} onClick={() => navigate(-1)} title="이전 페이지로">
            <ArrowLeft size={18} />
            <span>뒤로가기</span>
          </button>
          <button className={styles.navBtn} onClick={() => navigate('/')} title="메인 홈으로">
            <Home size={18} />
            <span>홈</span>
          </button>
        </div>
        <span className={styles.topCategory} style={{ borderColor: story.color || '#64748b', color: story.color || '#64748b' }}>
          {story.category}
        </span>
      </header>

      <main className={styles.mainWrapper}>
        
        {/* --- 2. 상단 레이아웃 영역 --- */}
        <section className={styles.introSection}>
          <div className={styles.imageBox}>
            <img src={story.imageUrl} alt={story.title} className={styles.mainImage} />
          </div>
          
          <div className={styles.infoBox}>
            <h1 className={styles.title}>{story.title}</h1>
            <p className={styles.desc}>{story.desc}</p>
            
            <div className={styles.metaList}>
              <div className={styles.metaItem}>
                <MapPin size={16} color={story.color || '#64748b'} />
                <span>위치 정보: {story.region || '정보 없음'}</span>
              </div>
              <div className={styles.metaItem}>
                <Calendar size={16} color="#64748b" />
                <span>테마 분류: {story.category} 공간 보존 조사</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. 하단 서사 중심 세로형 타임라인 영역 --- */}
        <section className={styles.timelineSection}>
          <div className={styles.timelineHeader}>
            <Clock size={20} color={story.color || '#64748b'} />
            <h2>시간의 기록 (역사 서사)</h2>
          </div>
          
          <div className={styles.timelineContainer}>
            {story.timeline && story.timeline.map((item, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.timelineBadgeColumn}>
                  <span className={styles.timeYear} style={{ backgroundColor: story.color || '#64748b' }}>
                    {item.year}
                  </span>
                  <div className={styles.timelineLine} />
                </div>
                
                <div className={styles.timelineContentCard}>
                  <h4 className={styles.timelineCardTitle}>{item.title}</h4>
                  <p className={styles.timelineCardText}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- 4. 가장 하단 지도 이동 확인 버튼 --- */}
        <footer className={styles.footerArea}>
          <button className={styles.mapActionBtn} onClick={() => navigate('/map')}>
            <Bookmark size={18} />
            <span>지도에서 위치 확인하기</span>
          </button>
        </footer>

      </main>
    </div>
  );
}

export default DetailPage;