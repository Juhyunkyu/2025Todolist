✅ ToDo Planner 구현 단계 문서: Part 2/3 (상세 정의)
이 문서는 ToDo Planner PWA 앱의 기능 중 노트, 캘린더, 생일 알림, 통계, 백업 공유 등의 구현을 위한 상세 계획 문서입니다. Claude 기반 클로드 IDE에서 오류 없이 동작하도록 정리되었습니다.

📝 7단계: 노트 모듈 구현
핵심 목표: Rich Text 기반의 노트 + 첨부 기능 구현
⬜ 에디터 후보군
React Quill: 사용 간편, HTML 출력

Tiptap: 확장성 뛰어남, Markdown 지원, 첨부파일 관리에 유리

Lexical: Facebook 제작, 초경량 에디터

→ 최종 선택: Tiptap
⬜ 데이터 구조 예시
interface Note {
id: string;
title: string;
content: string; // JSON from Tiptap
tags: string[];
createdAt: string;
updatedAt: string;
files?: FileMeta[];
templateId?: string;
}

interface FileMeta {
name: string;
url: string;
type: string;
}

🔧 구현 항목
노트 작성 및 편집 UI (<Editor />)

저장: IndexedDB(notes)에 저장 및 수정 시 updatedAt 반영

첨부파일 업로드: File System Access API 활용 (또는 Blob 저장)

템플릿 저장/불러오기: 노트 작성 후 템플릿으로 저장 기능 구현

태그 검색 및 필터링

전체 노트 리스트 페이지 구현 (/notes)

✅ 에디터 기능 세부:

이미지 업로드 버튼 → Blob URL로 삽입 → 이미지 아래 글 작성 가능

텍스트 정렬(왼쪽/중앙/오른쪽)

텍스트 강조: 굵게, 밑줄, 색상, 제목 크기 조절(Heading)

저장 시 Tiptap JSON content + 첨부파일 metadata 저장

📅 8단계: 캘린더 UI 구현
핵심 목표: 날짜 기반 투두/노트 탐색 및 시각화
⬜ 라이브러리 선택
FullCalendar: 일정 배지 표시, 커스터마이징 유리

🔧 구현 항목
날짜별 투두 수량 뱃지 표시

클릭 시 해당 날짜의 투두/노트 목록 모달로 출력

보기 전환: 월간/주간/일간 뷰 지원

오늘 날짜 강조 및 빠른 이동

상태 관리: selectedDate를 전역 상태로 (/stores/calendar.ts)

반복 투두/생일 등도 함께 표시 예정

🎂 9단계: 생일 알림 시스템 (양력/음력)
핵심 목표: 반복 알림 및 음력 지원
⬜ 기술 스택
lunar-calendar-js 또는 korean-lunar-calendar

⬜ 데이터 구조 예시
interface Birthday {
id: string;
name: string;
birthDate: string; // ISO
type: 'solar' | 'lunar';
repeat: boolean;
alarmTime: string; // ex) '09:00'
}

🔧 구현 항목
생일 등록 시 양력/음력 선택 가능 UI

매년 자동 반복 등록 (날짜 계산 로직 포함)

FCM 푸시 예약: 생일 전날 or 당일 오전 알림

생일 목록 페이지 (/birthdays) 및 월별 캘린더에 함께 표시

📊 10단계: 통계 및 데이터 시각화
핵심 목표: 활동 피드백 및 시각화 제공
⬜ 기술 스택
Chart.js 또는 Recharts

🔧 구현 항목
주간/월간 투두 완료율: 전체 대비 체크된 항목 비율 차트로 표시

태그별 사용량 분석 (ex: #업무 7건, #중요 4건)

활동 요약 메시지 출력:

예: “이번 주에는 15개의 할 일을 완료했습니다!”

상태 연동: /stores/statistics.ts

📤 11단계: 공유 및 백업 기능
핵심 목표: 사용자의 데이터 유지 및 외부 공유
🔧 구현 항목
JSON 내보내기:

todos, notes, birthdays를 하나의 JSON 파일로 export

파일명 예: todo-planner-backup-2025-08-01.json

JSON 불러오기:

기존 데이터를 덮어쓰기 전 확인창 필요

텍스트 공유:

특정 투두/노트 → 텍스트 복사 or 클립보드로 복사 버튼

URL 공유 (선택 기능):

추후 Supabase 연동 시 URL 공유 방식 고려 가능

📎 이후 Part 3 문서에서는 배포, 설치, 위젯, 품질 점검 및 릴리즈 정리를 안내합니다.
