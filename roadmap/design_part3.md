# 📋 ToDo Planner 구현 단계 문서: Part 3/3

> **진행률**: 1/4 단계 완료 (25% 완료)

이 문서는 ToDo Planner PWA의 앱 설치, 위젯 구성, 배포 전략, 테스트 및 릴리즈를 상세히 정리한 최종 구현 계획입니다.

---

## 📲 12단계: 앱 설치 테스트 및 위젯 지원

**핵심 목표**: 사용자 디바이스에 설치 가능한 앱 + 단축 기능 구성

### 📋 PWA 설정 사항

- [ ] **manifest.json 구성**
  ```json
  {
    "name": "ToDo Planner",
    "short_name": "Planner",
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#ffffff",
    "background_color": "#ffffff",
    "icons": [
      {
        "src": "/icons/icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ],
    "shortcuts": [
      {
        "name": "오늘 할 일",
        "short_name": "오늘",
        "url": "/?date=today",
        "icons": [{ "src": "/icons/today.png", "sizes": "96x96" }]
      }
    ]
  }
  ```

### ✅ 설치 테스트 체크리스트

- [x] 안드로이드 Chrome에서 홈화면 설치 동작 확인
- [x] iOS Safari: display: standalone 반영되었는지 확인
- [x] 데스크탑 크롬 설치 시 정상 아이콘 노출 여부

### 🔧 선택 구현: 웹 앱 위젯

- [ ] **Web App Widgets 구현 (Android Chrome 121+)**
  - [ ] Manifest에 widgets 필드 활용
  - [ ] 위젯 구현 (예: 오늘 할 일 보기)
  - [ ] MDN Web App Manifest - widgets 참고

---

## 🚀 13단계: Vercel 또는 Netlify 배포

**핵심 목표**: 안정적이고 쉬운 CI/CD 기반 배포

### 🛠️ 기본 설정

- [ ] **저장소 설정**
  - [ ] GitHub 또는 GitLab 연동
  - [ ] 배포 플랫폼: Vercel (Next.js 공식 지원)

### ✅ 설정 체크리스트

- [x] build 명령어: `next build`
- [x] 환경 변수 설정: (FCM 키, PWA 옵션 등 필요 시)
- [x] vercel.json 또는 Netlify headers에 service-worker 설정 적용

```json
"headers": [
  {
    "source": "/service-worker.js",
    "headers": [
      { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
    ]
  }
]
```

### 🔧 배포 후 테스트

- [ ] **기본 기능 테스트**
  - [ ] `/` 페이지 및 각 기능 라우팅 테스트
  - [ ] 오프라인 접근 시 캐시된 데이터 정상 로드 여부 확인
  - [ ] 홈 설치/아이콘 표시 여부 점검

---

## 🔍 14단계: QA 및 릴리즈 체크리스트

**핵심 목표**: 완성도 높은 릴리즈를 위한 품질 점검

### 🧪 QA 항목

- [ ] **기본 기능 테스트**

  - [ ] 모든 투두/노트 기능 로컬 저장 정상 동작
  - [ ] 알림 (Notification + FCM) 정상 발송 확인
  - [ ] 오프라인 상태에서 데이터 조회/수정 가능 여부

- [x] **테마 시스템 테스트 (완료)**

  - [x] 4가지 테마 (다크/라이트/오렌지/파스텔) 정상 동작 확인
  - [x] 실시간 테마 변경 및 컴포넌트 반영 테스트 완료
  - [x] showcase 페이지에서 확인 완료

- [ ] **고급 기능 테스트**
  - [ ] 에디터에서 이미지/텍스트 삽입 및 저장 테스트
  - [ ] 생일 알림 반복 여부 테스트 (양력/음력)

### 📊 Lighthouse 평가 항목

- [x] **성능(Performance)**: 90점 이상
- [x] **접근성(Accessibility)**: 90점 이상
- [x] **SEO 및 Best Practices** 점검

### 📋 버전명 규칙

- **v1.0.0**: 최초 배포
- **v1.1.0**: 알림 기능 강화 시
- **v2.0.0**: Supabase 연동 등 대형 업데이트 시

---

## 📦 15단계: 향후 확장 고려 사항

**핵심 목표**: 향후 기능 확장 시 대비하여 코드와 구조 미리 설계

### 🔮 확장 계획

- [ ] **Supabase 연동 (멀티 기기 동기화)**

  - [ ] 사용자 인증 시스템
  - [ ] 클라우드 데이터 동기화
  - [ ] 실시간 업데이트

- [ ] **사용자 계정 관리 및 백업**

  - [ ] 소셜 로그인 (Google, GitHub 등)
  - [ ] 자동 백업 시스템
  - [ ] 계정별 데이터 관리

- [ ] **협업 기능**

  - [ ] 투두 공유 (링크 또는 팀 협업)
  - [ ] 공유 노트북
  - [ ] 댓글 시스템

- [ ] **AI 기능**
  - [ ] AI 기반 일정 추천
  - [ ] 자동 태그 분류
  - [ ] 스마트 알림

---

## 📘 문서 완료

**전체 ToDo Planner PWA 구현 계획 3단계 문서가 모두 정리되었습니다.**

이제 각 기능을 단계별로 구현하거나, 선택적으로 Supabase 백엔드 연동으로 확장 가능하며 실제 서비스 배포도 준비된 상태입니다.

### 📊 전체 진행률 요약

- **Part 1**: 2/6 단계 완료 (33.3%)
- **Part 2**: 0/5 단계 완료 (0%)
- **Part 3**: 1/4 단계 완료 (25%)
- **전체**: 3/15 단계 완료 (20%)
