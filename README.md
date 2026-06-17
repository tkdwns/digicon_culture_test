# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


---

## 🗺️ 프론트엔드 페이지 구조 및 기능 명세서

### 1. 메인 홈 페이지 (`Home.jsx`)
서비스의 첫 얼굴이자, 사용자가 로컬 스토리를 탐색하는 중앙 허브입니다.

* 주요 UI 특징: * 화면 왼쪽 최상단 구석에 고정된 사이드바 토글 버튼(`☰`)

   * 어두운 네이비 톤의 상단 헤더와 중앙의 큰 검색창

   * 카테고리 뱃지와 썸네일 이미지가 포함된 격자형(Grid) 스토리 카드 목록

* 핵심 기능:

   * 사이드바 온오프(Toggle): 구석의 메뉴 버튼을 누르면 부드럽게 왼쪽에서 메뉴가 밀려 나오며, 바깥 어두운 영역(Overlay)을 누르면 다시 닫힘.

   * 지도 이동 포털: 사용자의 원래 기획대로 사이드바 내부에만 [문화 지도 펼치기] 버튼을 배치하여 지도 페이지로의 라우팅을 유도함.

   * 실시간 텍스트 필터링(검색): 검색창에 지역명, 장소, 분위기를 타이핑하면 `INITIAL_STORIES` 데이터의 제목(`title`)과 설명(`desc`)을 실시간으로 대조하여 카드를 필터링함. 검색 결과가 없을 시 전용 안내 문구 노출.

   * 상세 페이지 점프: 카드를 클릭하면 해당 스토리의 고유 ID 값을 주소창에 싣고 상세 페이지(`/detail/:id`)로 이동.

--- 

### 2. 문화 지도 페이지 (`MapPage.jsx`)
위치 기반으로 로컬 문화를 시각적으로 탐색하는 공간 인터랙션 페이지입니다.

* 주요 UI 특징:

   * 화면 전체를 채우는 오픈스트리트맵(Pigeon Maps) 레이어

   * 카테고리 고유 색상으로 표시되는 지도 위의 마커(Marker)들

   * 화면 왼쪽을 차지하며 나타나는 정보 카드 전용 사이드바

* 핵심 기능:

   * 동적 마커 맵핑: 데이터의 위도(`lat`)와 경도(`lng`)를 기반으로 지도 위에 고유한 색상 마커들을 실시간으로 뿌려줌.

   * 마커-사이드바 동기화: 지도 위 마커를 누르면 지도의 중심(`center`)과 줌(`zoom`)이 해당 위치로 부드럽게 이동하고, 동시에 왼쪽 사이드바가 열리면서 해당 장소의 대표 이미지, 카테고리 뱃지, 요약 설명이 담긴 미니 카드가 활성화됨.

   * 하단 카테고리 칩 필터링: 사이드바 하단에 배치된 동글동글한 카테고리 칩 버튼(예: 역사, 맛집 등)을 누르면 지도 위의 마커들이 해당 카테고리에 속한 마커들만 남고 실시간으로 필터링됨.

   * 홈으로 가기: 사이드바 상단의 홈 아이콘 버튼을 통해 언제든 메인 홈으로 즉시 복귀 가능.

--- 

### 3. 스토리 상세 페이지 (`DetailPage.jsx`)
선택한 로컬 스토리의 깊은 서사와 타임라인을 잡지(Magazine) 형태로 감상하는 콘텐츠 소비 페이지입니다.

* 주요 UI 특징:

   * 좌측 영역: 화면을 가득 채우는 고화질의 로컬 장소 대표 이미지와 타이틀 뱃지 공간

   * 우측 영역: 스크롤이 가능한 가독성 높은 세로형 내러티브 본문 공간

* 핵심 기능:

   * 동적 파라미터 매칭: 주소창의 ID(`/detail/:id`)를 리액트 라우터(`useParams`)로 읽어와 수많은 데이터 중 딱 일치하는 하나의 로컬 스토리 세부 정보를 매칭해 화면에 바인딩함.

   * 서사형 타임라인 레이아웃: 우측 콘텐츠 영역 하단에 점과 선으로 연결된 세로형 타임라인 인프라를 구축하여, 해당 로컬 장소가 가진 연도별 역사나 비하인드 스토리를 시간 순서대로 부드럽게 읽을 수 있도록 구현함.

   * 네비게이션 상단바: 스크롤에 구애받지 않도록 우측 상단에 홈(`Home`) 아이콘과 뒤로가기(`ArrowLeft`) 버튼을 배치하여 UX 편의성 제공.

--- 

## 🛠️ 백엔드 및 AI 결합을 위해 우리가 '교체'하게 될 부분 (Next Step)
현재 이 프론트엔드는 모든 데이터를 `src/data.js`라는 가짜 고정 데이터 파일에서 가져오고 있습니다. 앞으로 백엔드와 AI를 합치게 되면 프론트엔드 코드는 딱 이 부분이 바뀝니다.

1. `Home.jsx` / `MapPage.jsx` : 이제 고정된 `INITIAL_STORIES` 대신, 컴포넌트가 켜질 때 백엔드 서버에 데이터 요청을 보내(`axios.get('/api/stories')`) DB에 저장된 실제 지역 데이터를 받아와 카드를 뿌리게 됩니다.

2. AI 모델 컴포넌트 삽입 : 예를 들어 메인화면에 "AI에게 내 취향에 맞는 로컬 코스 추천받기" 버튼을 새로 만들거나, 상세페이지 하단에 "AI가 요약한 이 장소의 세 줄 평" 같은 영역을 개설하여 백엔드를 통해 AI 예측 결과값을 출력하는 코드를 심게 됩니다.