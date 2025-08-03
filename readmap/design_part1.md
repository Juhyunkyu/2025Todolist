✅ ToDo Planner 구현 단계 문서: Part 1/3 (상세 정의)
이 문서는 ToDo Planner PWA 앱의 실제 구현을 위한 클로드 IDE 최적화된 단계별 가이드입니다. Next.js App Router + Tailwind + Firebase FCM 기반으로 구성되며, 각 단계별 목표, 필요 기술, 예상 구조, 고려사항까지 상세히 기술합니다.

🧱 1단계: 프로젝트 셋업
핵심 목표: 기술 기반 구성 및 폴더 설계
⬜ 필요 사항
Node.js 18 이상

pnpm 또는 npm

VSCode 또는 클로드 IDE

🔧 구현 항목
npx create-next-app@latest todo-planner --app --ts

App Router 기반으로 생성

TypeScript 및 ESLint 포함

Tailwind CSS 설치:

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

tailwind.config.js 설정:

content 경로 지정: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}']

darkMode: 'class'

next-pwa 설치:

npm install next-pwa

next.config.js 설정:

const withPWA = require("next-pwa")({
dest: "public",
register: true,
skipWaiting: true,
disable: process.env.NODE_ENV === "development",
runtimeCaching: [
{
urlPattern: /^https?.*/,
handler: 'NetworkFirst',
options: {
cacheName: 'http-cache',
expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
},
},
],
});

module.exports = withPWA({
reactStrictMode: true,
});

폴더 구조:

/app
/features
/todo
/notes
/calendar
/components
/ui
/stores
/lib
/public

초기 페이지 구성: /app/page.tsx → 홈 캘린더, 투두 간단 프리뷰

🎨 2단계: 테마 시스템 구축 ✅ (구현 완료)
핵심 목표: 다크/라이트/컬러 테마 적용 및 전역 상태 관리
✅ 구현 완료 사항
Tailwind CSS + CSS 변수 조합

Zustand 또는 React Context

🔧 구현 항목 (완료된 것들)
✅ JSON 기반 테마 시스템 구축:

- `src/theme/theme.json`: Linear App 기반 테마 정의
- `src/theme/types.ts`: TypeScript 타입 정의
- `src/theme/index.ts`: 테마 export 및 유틸리티 함수

✅ 4가지 테마 구현:

- dark (기본): Linear 다크 테마
- light: 라이트 모드
- orange: 오렌지 컬러 테마
- pastel: 파스텔 그린 테마

✅ 동적 테마 변경 데모:

- `/showcase` 페이지에서 실시간 테마 변경 확인 가능
- 버튼, 입력필드, 카드, 색상 팔레트 등 컴포넌트 미리보기

🔄 향후 확장 예정:

- Context API 또는 Zustand로 전역 상태 관리
- 사용자 설정 저장 (localStorage)
- 모든 페이지에 테마 적용

💾 3단계: IndexedDB 구조 및 Service Worker
핵심 목표: 로컬 기반 앱 설계 및 오프라인 데이터 처리
⬜ 필요 사항
idb 라이브러리 설치

next-pwa를 통한 SW 등록

🔧 구현 항목
idb 셋업:

import { openDB } from 'idb';
export const db = await openDB('todo-planner', 1, {
upgrade(db) {
db.createObjectStore('todos', { keyPath: 'id' });
db.createObjectStore('notes', { keyPath: 'id' });
db.createObjectStore('birthdays', { keyPath: 'id' });
db.createObjectStore('templates', { keyPath: 'id' });
}
});

IndexedDB helper 함수 구현 /lib/db.ts

서비스워커 등록: 앞서 언급한 next.config.js 기반으로 자동 생성

로딩 시 초기 데이터 fetch → Zustand store로 올리기

오프라인 캐싱 확인: Lighthouse 및 실제 브라우저 테스트

🧩 4단계: UI 컴포넌트 시스템 설계
핵심 목표: 재사용 가능한 일관된 UI 시스템 구축
⬜ 필요 사항
Tailwind CSS utility-first 구조

컴포넌트 단위 분리 (Headless UI 활용 가능)

🔧 구현 항목
/components/ui/ 내 공통 컴포넌트 설계

Button.tsx, Input.tsx, Dialog.tsx, Select.tsx

Tailwind theme 기반 className 적용

prop-driven 디자인 (variant, size, theme)

예시:

<Button variant="primary" size="sm">추가</Button>

접근성 구현:

role, aria-label, tabIndex, focus-visible

✅ 5단계: ToDo 모듈 구현
핵심 목표: 핵심 기능 MVP 구현
⬜ 데이터 모델
interface Todo {
id: string;
title: string;
isDone: boolean;
tags: string[];
date: string; // ISO
repeat: 'none' | 'daily' | 'weekly' | 'monthly';
alarmTime?: string;
}

🔧 구현 항목
투두 목록 CRUD

addTodo, updateTodo, deleteTodo, toggleTodo

Zustand 또는 useReducer로 상태 관리

IndexedDB에 동기화 저장

필터링 및 검색 기능 (title, tag, 날짜 기준)

Drag-and-Drop 지원: react-beautiful-dnd

투두 반복: 완료 시 다음 반복일 생성

📣 6단계: 알림 시스템 구축 (필수)
핵심 목표: 앱이 종료된 상태에서도 알림 전송 가능하게 구현
⬜ 필요 사항
Firebase 프로젝트 및 Messaging 활성화

FCM 브라우저 SDK

Firebase Cloud Function (예약 푸시)

서비스워커 firebase-messaging-sw.js는 next-pwa와 충돌 방지 위해 별도 분리하여 /public/ 루트에 위치시켜야 함

🔧 구현 항목
Firebase SDK 연동

firebase-messaging-sw.js 수신 스크립트 작성

사용자 디바이스 토큰 등록 및 저장 (IndexedDB 또는 서버 예정)

알림 예약 시:

날짜와 시간 기준 → Firebase Cloud Function + Scheduler (예정)

FCM → 클라이언트 디바이스로 푸시 발송

백엔드 미사용 시 대안: setTimeout + Notification API (단, 앱 켜진 상태에서만 작동)

📍 주의 사항
알림 권한 요청은 UX 흐름에 맞춰 명확히 보여줄 것

Cloud Function/예약 푸시 없을 경우 알림 타이머는 ServiceWorker 또는 background 작업으로 구현해야 함

📎 다음 단계는 Part 2 문서에서 계속됩니다.
