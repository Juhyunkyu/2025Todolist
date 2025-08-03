# 📋 ToDo Planner 구현 단계 문서: Part 1/3

> **진행률**: 4/6 단계 완료 (66.7% 완료)

이 문서는 ToDo Planner PWA 앱의 실제 구현을 위한 클로드 IDE 최적화된 단계별 가이드입니다.  
Next.js App Router + Tailwind + Firebase FCM 기반으로 구성되며, 각 단계별 목표, 필요 기술, 예상 구조, 고려사항까지 상세히 기술합니다.

---

## 🧱 1단계: 프로젝트 셋업 ✅

**핵심 목표**: 기술 기반 구성 및 폴더 설계

### ✅ 필요 사항 (완료)

- [x] Node.js 18 이상
- [x] pnpm 또는 npm
- [x] VSCode 또는 클로드 IDE

### 🔧 구현 항목

- [x] **프로젝트 생성**
  ```bash
  ✅ Next.js 15.4.5 + TypeScript + App Router 설치 완료
  ```
- [x] **Tailwind CSS 설치 및 설정**
  ```bash
  ✅ Tailwind CSS v4 설치 완료
  ```
- [x] **tailwind.config.js 설정**
  - [x] content 경로 지정: `src/app/**/*.{js,ts,jsx,tsx,mdx}` 등 완료
  - [x] darkMode: `'class'` 설정 완료
  - [x] 테마 기반 커스텀 색상, 폰트, 애니메이션 확장 완료
- [ ] **PWA 설정** (Next.js 15 호환 이슈로 연기)
  ```bash
  # Next.js 15와 next-pwa 호환성 문제로 인해 수동 구현 예정
  ```
- [ ] **기본 PWA 기능 구현**

  - [ ] 수동 Service Worker 생성
  - [ ] 캐싱 전략 구현
  - [x] manifest.json 완료

- [x] **폴더 구조 생성 (완료)**

  ```
  ✅ /src/app          (완료)
  ✅ /src/features     (완료)
      /todo
      /notes
      /calendar
  ✅ /src/components   (완료)
    ✅ /ui             (완료 - Button, Input, Badge 등)
  ✅ /src/stores       (완료)
  ✅ /src/lib          (완료)
  ✅ /public           (완료)
  ✅ /src/theme        (완료)
  ```

- [x] **초기 페이지 구성**
  - [x] `/src/app/page.tsx` → 기본 Next.js 페이지 완료
  - [x] 홈 캘린더, 투두 간단 프리뷰로 업데이트 완료

---

## 🎨 2단계: 테마 시스템 구축 ✅

**핵심 목표**: 다크/라이트/컬러 테마 적용 및 전역 상태 관리

### ✅ 구현 완료 사항

- [x] **JSON 기반 테마 시스템 구축**

  - [x] `src/theme/theme.json`: Linear App 기반 테마 정의
  - [x] `src/theme/types.ts`: TypeScript 타입 정의
  - [x] `src/theme/index.ts`: 테마 export 및 유틸리티 함수

- [x] **4가지 테마 구현**

  - [x] dark (기본): Linear 다크 테마
  - [x] light: 라이트 모드
  - [x] orange: 오렌지 컬러 테마
  - [x] pastel: 파스텔 그린 테마

- [x] **동적 테마 변경 데모**
  - [x] `/showcase` 페이지에서 실시간 테마 변경 확인 가능
  - [x] 버튼, 입력필드, 카드, 색상 팔레트 등 컴포넌트 미리보기

### 🔄 향후 확장 예정

- [ ] Context API 또는 Zustand로 전역 상태 관리
- [ ] 사용자 설정 저장 (localStorage)
- [ ] 모든 페이지에 테마 적용

---

## 💾 3단계: IndexedDB 구조 및 Service Worker

**핵심 목표**: 로컬 기반 앱 설계 및 오프라인 데이터 처리

### ⬜ 필요 사항

- [ ] idb 라이브러리 설치
- [ ] next-pwa를 통한 SW 등록

### 🔧 구현 항목

- [ ] **idb 라이브러리 설치 및 DB 셋업**

  ```bash
  npm install idb
  ```

  ```typescript
  import { openDB } from "idb";
  export const db = await openDB("todo-planner", 1, {
    upgrade(db) {
      db.createObjectStore("todos", { keyPath: "id" });
      db.createObjectStore("notes", { keyPath: "id" });
      db.createObjectStore("birthdays", { keyPath: "id" });
      db.createObjectStore("templates", { keyPath: "id" });
    },
  });
  ```

- [ ] **IndexedDB helper 함수 구현**

  - [ ] `/lib/db.ts` 파일 생성
  - [ ] CRUD 함수들 구현 (add, get, update, delete)

- [ ] **서비스워커 등록**

  - [ ] next.config.js 기반으로 자동 생성 확인
  - [ ] PWA 캐싱 전략 적용

- [ ] **데이터 동기화**
  - [ ] 로딩 시 초기 데이터 fetch → Zustand store로 올리기
  - [ ] 오프라인 캐싱 확인: Lighthouse 및 실제 브라우저 테스트

---

## 🧩 4단계: UI 컴포넌트 시스템 설계 ✅

**핵심 목표**: 재사용 가능한 일관된 UI 시스템 구축

### ✅ 필요 사항 (완료)

- [x] Tailwind CSS utility-first 구조
- [x] 컴포넌트 단위 분리 (Headless UI 활용 가능)

### 🔧 구현 항목

- [x] **기본 UI 컴포넌트 구현**

  - [x] `/src/components/ui/Button/` (완료)
  - [x] `/src/components/ui/Input/` (완료)
  - [x] `/src/components/ui/Badge/` (완료)
  - [x] `/src/components/ui/Checkbox.tsx` (완료)
  - [x] `/src/components/ui/Select.tsx` (완료)
  - [x] `/src/components/ui/Card.tsx` (완료)
  - [ ] `/src/components/ui/Dialog.tsx` (생성 필요)

- [x] **컴포넌트 디자인 시스템**

  - [x] Tailwind theme 기반 className 적용
  - [x] prop-driven 디자인 (variant, size, theme)
  - [x] 예시: `<Button variant="primary" size="sm">추가</Button>`
  - [x] index.ts로 통합 export 구성

- [x] **접근성 구현**
  - [x] role, aria-label 속성 추가
  - [x] tabIndex, focus-visible 지원

---

## ⬜ 5단계: ToDo 모듈 구현

**핵심 목표**: 핵심 기능 MVP 구현

### 📋 데이터 모델 정의

```typescript
interface Todo {
  id: string;
  title: string;
  isDone: boolean;
  tags: string[];
  date: string; // ISO
  repeat: "none" | "daily" | "weekly" | "monthly";
  alarmTime?: string;
}
```

### 🔧 구현 항목

- [ ] **투두 목록 CRUD 구현**

  - [ ] addTodo, updateTodo, deleteTodo, toggleTodo 함수
  - [ ] Zustand 또는 useReducer로 상태 관리
  - [ ] IndexedDB에 동기화 저장

- [ ] **고급 기능**
  - [ ] 필터링 및 검색 기능 (title, tag, 날짜 기준)
  - [ ] Drag-and-Drop 지원: react-beautiful-dnd 설치
  - [ ] 투두 반복: 완료 시 다음 반복일 생성

---

## 📣 6단계: 알림 시스템 구축 (필수)

**핵심 목표**: 앱이 종료된 상태에서도 알림 전송 가능하게 구현

### ⬜ 필요 사항

- [ ] Firebase 프로젝트 및 Messaging 활성화
- [ ] FCM 브라우저 SDK
- [ ] Firebase Cloud Function (예약 푸시)
- [ ] 서비스워커 `firebase-messaging-sw.js` (next-pwa와 충돌 방지)

### 🔧 구현 항목

- [ ] **Firebase 설정**

  - [ ] Firebase SDK 연동
  - [ ] `firebase-messaging-sw.js` 수신 스크립트 작성
  - [ ] `/public/` 루트에 서비스워커 파일 분리 배치

- [ ] **디바이스 토큰 관리**

  - [ ] 사용자 디바이스 토큰 등록 및 저장 (IndexedDB 또는 서버)
  - [ ] 토큰 갱신 로직 구현

- [ ] **알림 예약 시스템**
  - [ ] 날짜와 시간 기준 → Firebase Cloud Function + Scheduler
  - [ ] FCM → 클라이언트 디바이스로 푸시 발송
  - [ ] **백엔드 미사용 시 대안**: setTimeout + Notification API

### 📍 주의 사항

- ⚠️ 알림 권한 요청은 UX 흐름에 맞춰 명확히 보여줄 것
- ⚠️ Cloud Function/예약 푸시 없을 경우 알림 타이머는 ServiceWorker 또는 background 작업으로 구현해야 함

---

## 📎 다음 단계

**Part 2 문서**에서 노트 모듈, 캘린더 UI, 생일 알림, 통계, 백업 기능을 계속 진행합니다.

**진행률**: 4/6 단계 완료 (66.7% 완료)
