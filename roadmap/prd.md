📘 Product Requirements Document: All-in-One ToDo Planner (PWA)
🧭 개요 (Overview)
프로젝트 명: ToDo Planner

목표: 사용자가 웹 및 모바일에서 설치 가능한 PWA 기반의 일정/할일/노트를 통합 관리할 수 있는 생산성 앱 개발

타겟 사용자: 학생, 프리랜서, 직장인 등 자기 주도적 시간/업무 관리를 원하는 모든 사용자

🎯 주요 기능 (Core Features)
✅ 투두리스트
할일 생성, 수정, 삭제

체크리스트 구조

알림 기능 (Notification API + setTimeout → FCM 기반 푸시 알림으로 확장하여 앱이 꺼진 상태에서도 예약 알림 제공)

드래그앤드롭으로 순서 변경 (react-beautiful-dnd)

반복 일정 설정 (일간/주간/월간)

태그 기능: ex: #중요, #업무 와 같은 태그 추가 및 검색 필터링

검색 기능 포함

📝 노트 작성
자유로운 게시글 형태의 노트 작성

텍스트 에디터 지원: React Quill / Tiptap / Lexical

이미지, 동영상, 파일 첨부 기능 (File System Access API 선택적 사용)

작성일, 수정일 자동 저장

노트 검색 및 목록 관리

태그 기능 포함

템플릿 기능: 자주 사용하는 노트 형식을 저장/불러오기

날짜 지정 기능: 특정 날짜와 노트를 연결하여 캘린더에서 접근 가능

마크다운 저장 옵션, 음성 입력 기능 고려 (SpeechRecognition API)

📅 캘린더 통합
날짜별 투두/노트 연결 및 표시 (배지 또는 점)

클릭 시 해당 날짜의 투두/노트 조회 가능

주간, 월간, 일간 뷰 전환 가능 (react-calendar / FullCalendar)

생일 알림 기능 (양력/음력 모두 지원, 연간 반복)

음력 생일의 경우 양력으로 변환하여 표시 및 알림 예약

음력 변환을 위한 lunar-calendar 또는 한국천문연구원 API 활용 예정

일정 완료 마킹 시 색상 또는 도트 변경

📊 통계 및 데이터 시각화
주간/월간 투두 완료율 차트 (Chart.js 또는 Recharts)

활동 요약 메시지 제공 (ex: "이번 주에는 투두 15개 완료")

연속 달성 streak 기능 고려

사용자 참여를 유도하는 미니 배지 또는 보상 UI 고려

📤 공유 기능
투두/노트를 텍스트 복사하여 외부 앱으로 공유

JSON 내보내기/불러오기 지원

URL 기반 공유 (선택적, Supabase 연동 이후 지원 가능)

🎨 테마 및 사용자 편의 기능
**테마 변경 시스템 (구현 완료):**

- 4가지 테마 지원: 다크모드(기본) / 라이트모드 / 오렌지 / 파스텔
- JSON 기반 테마 시스템 (`src/theme/theme.json`)
- 동적 테마 변경 기능 (showcase 페이지에서 데모 확인 가능)
- 향후 전역 Context API로 확장 예정

자동 저장 기능 (IndexedDB)

오프라인 사용 가능 (IndexedDB 기반)

데이터 백업 및 복구 기능 (JSON 기반)

위젯 기능: PWA Manifest의 shortcuts / widgets 필드 활용해 오늘 할 일 위젯 제공

다국어 지원 구조 준비 (next-i18next 등)

접근성 고려한 UI (색상 대비, 키보드 접근 등)

설치형 앱으로 작동 (PWA): Android/iOS/데스크톱 모두 홈 화면 추가 및 앱처럼 동작

🧱 기술 스택 (Tech Stack)
프레임워크: Next.js 13+ (App Router)

PWA: next-pwa, manifest.json, service worker

UI: Tailwind CSS, Linear App Theme (JSON 기반 테마 시스템)

상태 관리: Zustand 또는 Context API

스토리지: IndexedDB (idb 라이브러리 활용)

날짜 계산: Day.js 또는 date-fns

음력 변환: lunar-calendar (또는 한국천문연구원 API)

드래그앤드롭: react-beautiful-dnd

캘린더 UI: react-calendar / FullCalendar

텍스트 에디터: React Quill / Tiptap / Lexical

알림: FCM 기반 Push 알림 (필수 기능으로 포함)

파일 저장소: File System Access API (선택)

차트: Chart.js 또는 Recharts

다국어: next-i18next (향후)

인증/백엔드: IndexedDB 중심 → Firebase 연동 예정 (알림 및 예약 처리)

🏗️ 프로젝트 구조 (Project Structure)

```
src/
├── app/                           # Next.js App Router
│   ├── page.tsx                   # 홈페이지 (캘린더 중심)
│   ├── layout.tsx                 # 루트 레이아웃
│   ├── globals.css                # 글로벌 스타일
│   │
│   ├── showcase/                  # 🎨 UI 컴포넌트 쇼케이스 (구현 완료)
│   │   └── page.tsx               # Linear Theme 기반 컴포넌트 데모
│   │                              # - 4가지 테마 실시간 미리보기
│   │                              # - 버튼, 입력필드, 카드 등 UI 컴포넌트 갤러리
│   │                              # - 테마 변경 시스템 데모 페이지
│   │
│   ├── todos/                     # 📝 ToDo 모듈
│   │   ├── page.tsx               # ToDo 리스트 페이지
│   │   └── [id]/                  # 개별 ToDo 상세
│   │
│   ├── notes/                     # 📄 Note 모듈
│   │   ├── page.tsx               # Note 리스트 페이지
│   │   ├── new/                   # 새 노트 작성
│   │   └── [id]/                  # 개별 노트 상세/편집
│   │
│   ├── calendar/                  # 📅 Calendar 모듈
│   │   └── page.tsx               # 캘린더 페이지
│   │
│   ├── statistics/                # 📊 Statistics 모듈
│   │   └── page.tsx               # 통계 대시보드
│   │
│   └── settings/                  # ⚙️ Settings 모듈
│       ├── page.tsx               # 설정 페이지
│       ├── themes/                # 테마 설정
│       └── backup/                # 백업/복구
│
├── components/                    # 🧩 재사용 가능한 컴포넌트들
│   ├── ui/                       # 기본 UI 컴포넌트 라이브러리
│   │   ├── Button/               # 버튼 컴포넌트 (완성)
│   │   ├── Input/                # 입력 필드 컴포넌트 (완성)
│   │   ├── Badge/                # 배지 컴포넌트 (완성)
│   │   ├── Card/                 # 카드 컴포넌트
│   │   ├── Modal/                # 모달 컴포넌트
│   │   ├── Calendar/             # 캘린더 컴포넌트
│   │   └── Chart/                # 차트 컴포넌트
│   │
│   ├── layout/                   # 레이아웃 컴포넌트들
│   │   ├── Header/               # 상단 네비게이션
│   │   ├── Sidebar/              # 사이드바 메뉴
│   │   └── Footer/               # 하단
│   │
│   ├── features/                 # 기능별 컴포넌트들
│   │   ├── todo/                 # ToDo 관련 컴포넌트들
│   │   ├── note/                 # Note 관련 컴포넌트들
│   │   ├── calendar/             # Calendar 관련 컴포넌트들
│   │   └── statistics/           # Statistics 관련 컴포넌트들
│   │
│   └── shared/                   # 공통 컴포넌트들
│       ├── LoadingSpinner/       # 로딩 스피너
│       ├── ErrorBoundary/        # 에러 바운더리
│       └── ConfirmDialog/        # 확인 다이얼로그
│
├── lib/                          # 유틸리티 & 서비스
│   ├── db/                       # IndexedDB 관련
│   ├── services/                 # 비즈니스 로직
│   └── utils.ts                  # 유틸리티 함수들 (완성)
│
├── theme/                        # 테마 시스템
│   ├── index.ts                  # 테마 설정 (완성)
│   ├── types.ts                  # 테마 타입 (완성)
│   └── theme.json                # Linear App Theme (완성)
│
├── hooks/                        # 커스텀 훅들
│   ├── useTodos.ts               # ToDo 관련 훅
│   ├── useNotes.ts               # Note 관련 훅
│   ├── useTheme.ts               # 테마 관련 훅
│   └── useNotification.ts        # 알림 관련 훅
│
└── types/                        # TypeScript 타입 정의
    ├── todo.ts                   # ToDo 관련 타입
    ├── note.ts                   # Note 관련 타입
    ├── calendar.ts               # Calendar 관련 타입
    └── global.ts                 # 전역 타입
```

🗂️ 데이터 구조 (IndexedDB 기반)
todos: { id, title, done, dueDate, tags[], repeatRule, notified, position }

notes: { id, content, createdAt, updatedAt, tags[], files[], date }

tags: { id, label, color }

templates: { id, type: 'todo' | 'note', content }

birthdays: { id, name, solarDate?, lunarDate?, isLunar: boolean, repeat: boolean }

settings: { theme, language, notificationEnabled, fcmToken }

🔧 사용자 흐름 (User Flow)
[앱 첫 진입] → [캘린더] → 날짜 클릭 → 해당 날짜의 투두/노트 확인 및 추가

[투두리스트] → 항목 추가/편집/삭제 → 태그 추가 → 체크/순서 변경

[노트] → 템플릿 선택 후 작성 → 이미지/파일 첨부 → 태그 추가 및 날짜 지정

[통계] → 완료율 차트, 활동 요약 확인

[설정] → 테마 변경, 알림 설정, 데이터 백업, 음력 생일 등록 여부 설정

📅 마일스톤 (개발 단계)
초기 프로젝트 셋업

Next.js + Tailwind + next-pwa 세팅

IndexedDB 구조 정의 및 서비스 워커 등록

투두 모듈 MVP

CRUD, 알림, 반복 일정, 태그, 드래그 정렬

노트 모듈 MVP

에디터 + 파일 첨부 + 날짜 저장

캘린더 모듈

날짜별 투두/노트 연동, 다양한 뷰 지원

태그/검색 기능

공통 태그 DB 설계, 필터/검색 UI 구현

템플릿 기능

투두/노트 템플릿 저장, 적용 기능

통계/시각화

차트 기반 완료율/활동 요약 제공

공유/백업 기능

JSON 백업, 텍스트 공유

테마 시스템 ✅ (구현 완료)

- JSON 기반 테마 시스템 (`src/theme/`) 구축 완료
- 4가지 테마 (다크/라이트/오렌지/파스텔) 구현 완료
- Showcase 페이지에서 테마 변경 데모 확인 가능
- 향후 전역 Context API로 실제 앱에 적용 예정

생일 알림 시스템

연간 반복 알림 구현

음력 지원 및 양력 변환 로직 구현

위젯 기능

Manifest shortcuts 또는 Web widgets API 활용

푸시 알림 시스템 구축

Firebase Cloud Messaging 연동을 통해 예약된 시간에 푸시 알림 전송 (필수 기능)

예약 시간 + 디바이스 토큰 저장 → Firebase Functions 또는 서버에서 FCM API 호출

배포

Vercel 또는 Netlify 배포, PWA 설치 테스트 (모바일/PC 앱처럼 동작)

🛤️ 향후 확장 계획 (Optional)
Firebase 사용자 인증 연동 (로그인 기반 사용 데이터 분리)

다중 디바이스 동기화

협업 기능 (ToDo 공유, 댓글 등)

정적 이미지 CDN 최적화 (Cloudflare R2 등)
