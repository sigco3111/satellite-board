
# 위성 궤도 시각화 (Satellite Orbit Visualizer)

실시간 TLE(Two-Line Element set) 데이터를 기반으로 인공위성을 검색하고, 선택된 위성의 궤도를 3D 지구본 위에 시각화하는 인터랙티브 웹 애플리케이션입니다. Google Gemini API를 연동하여 위성에 대한 상세한 설명을 AI가 생성해주는 기능도 포함하고 있습니다.

실행주소1 : https://satellite-board.vercel.app/

실행주소2 : https://dev-canvas-pi.vercel.app/

## ✨ 주요 기능

- **🛰️ 실시간 위성 검색**: 위성 이름을 입력하여 관련 위성 목록을 실시간으로 검색합니다.
- **🌐 3D 궤도 시각화**: D3.js를 사용하여 구현된 인터랙티브 3D 지구본 위에 위성의 실제 궤도를 표시합니다.
- **📡 실시간 위성 추적**: 선택된 위성이 현재 궤도를 따라 움직이는 모습을 실시간으로 추적하여 보여줍니다.
- ** 경로 예측**: 위성의 현재 위치를 기준으로 과거와 미래의 예상 경로를 동적으로 시각화합니다.
- **🤖 AI 기반 위성 설명**: Google Gemini API를 활용하여 선택한 위성에 대한 목적, 특징 등 상세 정보를 AI가 생성하여 제공합니다.
- **🔑 사용자 API 키 관리**: 사용자가 자신의 Gemini API 키를 직접 입력, 저장, 삭제할 수 있으며, 이 정보는 브라우저의 로컬 스토리지에 안전하게 보관됩니다.
- **📊 상세 정보 표시**: 위성의 TLE 데이터와 현재 고도, 속도, 궤도 주기, 경사각 등 계산된 궤도 정보를 함께 제공합니다.
- **📱 반응형 디자인**: 데스크톱과 모바일 등 다양한 화면 크기에서 최적의 사용 경험을 제공합니다.

## 🛠️ 사용 기술

- **프론트엔드**: React, TypeScript
- **시각화 라이브러리**: D3.js
- **위성 궤도 계산**: satellite.js
- **AI**: Google Gemini API (@google/genai)
- **스타일링**: Tailwind CSS
- **데이터 API**: [TLE API (by Ivan Stanojevic)](https://tle.ivanstanojevic.me/api/tle)
- **유틸리티**: lodash (debounce)

## 🚀 시작하기

### 사전 요구 사항

- 최신 버전의 웹 브라우저 (Chrome, Firefox, Safari, Edge 등)
- Google Gemini API 키 (AI 기능 사용 시 필요)
  - [Google AI Studio](https://aistudio.google.com/app/apikey)에서 무료로 발급받을 수 있습니다.

### 로컬에서 실행하기

이 프로젝트는 별도의 빌드 과정 없이 정적 파일로 구성되어 있어, 웹 서버 없이도 `index.html` 파일을 브라우저에서 직접 열어 실행할 수 있습니다.

1.  **프로젝트 클론 또는 다운로드**
    ```bash
    git clone https://github.com/your-username/satellite-visualizer.git
    cd satellite-visualizer
    ```

2.  **`index.html` 파일 열기**
    프로젝트 폴더에 있는 `index.html` 파일을 웹 브라우저로 직접 열면 애플리케이션이 실행됩니다.

    > **참고**: 일부 브라우저의 보안 정책으로 인해 로컬 파일 시스템에서 직접 모듈을 로드하는 데 문제가 발생할 수 있습니다. 이 경우, 간단한 로컬 서버를 구동하는 것을 권장합니다.
    >
    > ```bash
    > # Python이 설치되어 있는 경우
    > python -m http.server
    >
    > # Node.js와 serve 패키지가 설치되어 있는 경우
    > npx serve
    > ```
    >
    > 이후 브라우저에서 `http://localhost:8000` (또는 해당 포트)으로 접속하세요.

## 📖 사용 방법

1.  **API 키 설정 (선택 사항)**
    - AI가 생성하는 위성 설명을 이용하려면 Gemini API 키가 필요합니다.
    - 화면 상단의 헤더에 있는 입력 필드에 자신의 API 키를 붙여넣고 **'저장'** 버튼을 누릅니다.
    - 키가 성공적으로 저장되면 상태 표시등이 'Active'로 변경됩니다.
    - 저장된 키를 삭제하려면 **'삭제'** 버튼을 클릭하세요.

2.  **위성 검색 및 선택**
    - '추천 위성' 목록에서 원하는 위성을 클릭하거나, 검색창에 위성 이름을 3자 이상 입력하여 검색합니다.
    - 검색 결과 목록에서 위성을 선택하면 해당 위성의 상세 정보와 TLE 데이터가 표시되고, 지구본에 궤도 시각화가 시작됩니다.

3.  **AI 설명 기능 활성화**
    - API 키가 'Active' 상태일 때, 헤더의 'Gemini 기능' 토글을 켜세요.
    - 위성을 선택하면 '위성 상세 정보' 패널에 AI가 생성한 설명이 나타납니다.

4.  **지구본과 상호작용**
    - 마우스로 지구본을 드래그하여 자유롭게 회전시킬 수 있습니다.
    - 위성 선택 시, 시점이 해당 위성의 현재 위치로 부드럽게 이동합니다.

## 📂 프로젝트 구조

```
/
├── components/               # React 컴포넌트
│   ├── icons/                # SVG 아이콘 컴포넌트
│   ├── Header.tsx            # 헤더 (API 키 관리, AI 토글)
│   ├── Loader.tsx            # 로딩 스피너
│   ├── OrbitVisualizer.tsx   # 3D 지구본 및 궤도 시각화
│   ├── SatelliteInfoPanel.tsx# 위성 상세 정보 및 AI 설명
│   ├── SatelliteList.tsx     # 위성 검색 및 목록
│   └── TleDisplay.tsx        # TLE 데이터 표시 (현재는 InfoPanel에 통합됨)
├── App.tsx                   # 메인 애플리케이션 컴포넌트 (상태 관리 및 로직)
├── index.html                # HTML 진입점
├── index.tsx                 # React 앱 마운트 포인트
├── metadata.json             # 프로젝트 메타데이터
├── README.md                 # 프로젝트 설명 파일
└── types.ts                  # TypeScript 타입 정의
```
