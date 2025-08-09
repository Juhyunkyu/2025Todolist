"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Badge,
  Card,
  Checkbox,
  Select,
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import {
  addNote,
  getNotes,
  deleteNote,
  clearAllData,
  exportData,
} from "@/lib/db";
import HierarchicalTodoList from "@/components/HierarchicalTodoList";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 내부 컴포넌트 - useTheme 사용
function DBTestContent() {
  const { currentTheme, selectedTheme, setSelectedTheme } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);

  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [message, setMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [selectValue, setSelectValue] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const notesData = await getNotes();
      setNotes(notesData);
      setMessage("데이터 로드 완료!");
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      setMessage("데이터 로드에 실패했습니다.");
    }
  };

  const handleAddNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    try {
      const newNote = await addNote({
        title: newNoteTitle,
        content: newNoteContent,
        tags: [],
      });
      setNotes((prev) => [...prev, newNote]);
      setNewNoteTitle("");
      setNewNoteContent("");
      setMessage("노트가 추가되었습니다!");
    } catch (error) {
      console.error("노트 추가 실패:", error);
      setMessage("노트 추가에 실패했습니다.");
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setMessage("노트가 삭제되었습니다!");
    } catch (error) {
      console.error("노트 삭제 실패:", error);
      setMessage("노트 삭제에 실패했습니다.");
    }
  };

  const handleCycleTheme = async () => {
    const themes = ["dark", "light", "orange", "pastel"] as const;
    const currentIndex = themes.indexOf(selectedTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];

    setSelectedTheme(newTheme);
    setMessage(`테마가 ${newTheme}로 변경되었습니다!`);
  };

  const handleClearData = async () => {
    try {
      await clearAllData();
      setNotes([]);
      setMessage("모든 데이터가 삭제되었습니다!");
    } catch (error) {
      console.error("데이터 삭제 실패:", error);
      setMessage("데이터 삭제에 실패했습니다.");
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `todolist-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("데이터 내보내기 완료!");
    } catch (error) {
      console.error("데이터 내보내기 실패:", error);
      setMessage("데이터 내보내기에 실패했습니다.");
    }
  };

  return (
    <div
      style={{
        padding: currentTheme.spacing["6"],
        backgroundColor: currentTheme.colors.background.primary,
        minHeight: "100vh",
        color: currentTheme.colors.text.primary,
      }}
    >
      {/* 헤더 */}
      <div style={{ marginBottom: currentTheme.spacing["8"] }}>
        <h1
          style={{
            fontSize: currentTheme.typography.fontSize["3xl"],
            fontWeight: currentTheme.typography.fontWeight.bold,
            marginBottom: currentTheme.spacing["4"],
            color: currentTheme.colors.text.primary,
          }}
        >
          📋 IndexedDB 테스트 페이지
        </h1>
        <p
          style={{
            fontSize: currentTheme.typography.fontSize.lg,
            color: currentTheme.colors.text.secondary,
            marginBottom: currentTheme.spacing["4"],
          }}
        >
          현재 테마: <Badge variant="default">{selectedTheme}</Badge>
        </p>

        <div
          style={{
            display: "flex",
            gap: currentTheme.spacing["4"],
            flexWrap: "wrap",
          }}
        >
          <Button onClick={handleCycleTheme} variant="primary">
            다음 테마로 변경
          </Button>
          <Button onClick={loadData} variant="secondary">
            데이터 새로고침
          </Button>
          <Button onClick={handleExportData} variant="secondary">
            데이터 내보내기
          </Button>
          <Button onClick={() => setShowConfirmDialog(true)} variant="ghost">
            모든 데이터 삭제
          </Button>
          <Button onClick={() => setShowDialog(true)} variant="secondary">
            Dialog 테스트
          </Button>
        </div>

        {message && (
          <div
            style={{
              marginTop: currentTheme.spacing["4"],
              padding: currentTheme.spacing["3"],
              backgroundColor: currentTheme.colors.background.tertiary,
              borderRadius: currentTheme.borderRadius.md,
              color: currentTheme.colors.text.secondary,
            }}
          >
            {message}
          </div>
        )}
      </div>

      {/* 계층적 할일 관리 시스템 */}
      <div style={{ marginBottom: currentTheme.spacing["8"] }}>
        <h2
          style={{
            fontSize: currentTheme.typography.fontSize["2xl"],
            fontWeight: currentTheme.typography.fontWeight.bold,
            color: currentTheme.colors.text.primary,
            marginBottom: currentTheme.spacing["6"],
            textAlign: "center",
          }}
        >
          🌳 계층적 할일 관리 시스템
        </h2>

        <p
          style={{
            color: currentTheme.colors.text.secondary,
            fontSize: currentTheme.typography.fontSize.base,
            lineHeight: "1.6",
            textAlign: "center",
            maxWidth: "600px",
            margin: `0 auto ${currentTheme.spacing["6"]} auto`,
          }}
        >
          📋 <strong>장보기</strong> → 배추, 고추장, 만두, 삼겹살
          <br />
          🎯 부모 항목 클릭 → 하위 메뉴 펼치기/접기
          <br />
          ✅ 하위 항목 모두 완료 → 부모 항목 자동 완료
          <br />
          📝 더블클릭으로 제목 수정, 복사 기능 지원
          <br />
          🖱️ 드래그&드롭으로 순서 변경 (상위/하위 항목 모두 가능)
        </p>

        <HierarchicalTodoList
          title="📝 스마트 할일 관리"
          showAddButton={true}
          showCopyButton={true}
          showStats={true}
        />
      </div>

      {/* 노트 섹션 */}
      <Card>
        <h2
          style={{
            fontSize: currentTheme.typography.fontSize.xl,
            fontWeight: currentTheme.typography.fontWeight.semibold,
            marginBottom: currentTheme.spacing["4"],
            color: currentTheme.colors.text.primary,
          }}
        >
          📓 노트 관리 ({notes.length}개)
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: currentTheme.spacing["3"],
            marginBottom: currentTheme.spacing["4"],
          }}
        >
          <Input
            placeholder="노트 제목..."
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
          />
          <textarea
            placeholder="노트 내용..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              backgroundColor: currentTheme.colors.background.tertiary,
              border: `1px solid ${currentTheme.colors.border.default}`,
              borderRadius: currentTheme.borderRadius.md,
              padding: currentTheme.spacing["3"],
              fontSize: currentTheme.typography.fontSize.sm,
              color: currentTheme.colors.text.primary,
              resize: "vertical",
            }}
          />
          <Button onClick={handleAddNote} style={{ alignSelf: "flex-start" }}>
            노트 추가
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: currentTheme.spacing["4"],
          }}
        >
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                padding: currentTheme.spacing["4"],
                backgroundColor: currentTheme.colors.background.tertiary,
                borderRadius: currentTheme.borderRadius.md,
                border: `1px solid ${currentTheme.colors.border.default}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: currentTheme.spacing["2"],
                }}
              >
                <h3
                  style={{
                    fontSize: currentTheme.typography.fontSize.lg,
                    fontWeight: currentTheme.typography.fontWeight.medium,
                    color: currentTheme.colors.text.primary,
                  }}
                >
                  {note.title}
                </h3>
                <Button
                  onClick={() => handleDeleteNote(note.id)}
                  variant="ghost"
                  size="sm"
                >
                  삭제
                </Button>
              </div>
              <p
                style={{
                  color: currentTheme.colors.text.secondary,
                  fontSize: currentTheme.typography.fontSize.sm,
                  lineHeight: "1.6",
                }}
              >
                {note.content}
              </p>
              <div
                style={{
                  marginTop: currentTheme.spacing["2"],
                  fontSize: currentTheme.typography.fontSize.xs,
                  color: currentTheme.colors.text.muted,
                }}
              >
                생성일: {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: currentTheme.spacing["8"],
                color: currentTheme.colors.text.muted,
              }}
            >
              아직 노트가 없습니다. 위에서 새 노트를 추가해보세요!
            </div>
          )}
        </div>
      </Card>

      {/* Dialog 데모 */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title="Dialog 테스트"
        description="이것은 완전한 기능을 갖춘 Dialog 컴포넌트입니다. 테마가 완벽하게 적용됩니다!"
        size="md"
      >
        <DialogContent>
          <div style={{ marginBottom: currentTheme.spacing["4"] }}>
            <h4
              style={{
                fontSize: currentTheme.typography.fontSize.base,
                fontWeight: currentTheme.typography.fontWeight.medium,
                color: currentTheme.colors.text.primary,
                marginBottom: currentTheme.spacing["2"],
              }}
            >
              🎨 테마 기능 테스트
            </h4>
            <p
              style={{
                color: currentTheme.colors.text.secondary,
                fontSize: currentTheme.typography.fontSize.sm,
                lineHeight: "1.6",
                marginBottom: currentTheme.spacing["4"],
              }}
            >
              현재 테마: <Badge variant="default">{selectedTheme}</Badge>
            </p>
            <p
              style={{
                color: currentTheme.colors.text.secondary,
                fontSize: currentTheme.typography.fontSize.sm,
                lineHeight: "1.6",
              }}
            >
              &ldquo;다음 테마로 변경&rdquo; 버튼을 눌러보세요. Dialog도 즉시
              테마가 변경됩니다!
            </p>
          </div>

          <div style={{ marginBottom: currentTheme.spacing["4"] }}>
            <h4
              style={{
                fontSize: currentTheme.typography.fontSize.base,
                fontWeight: currentTheme.typography.fontWeight.medium,
                color: currentTheme.colors.text.primary,
                marginBottom: currentTheme.spacing["2"],
              }}
            >
              ⚡ 기능 목록
            </h4>
            <ul
              style={{
                color: currentTheme.colors.text.secondary,
                fontSize: currentTheme.typography.fontSize.sm,
                lineHeight: "1.6",
                paddingLeft: currentTheme.spacing["4"],
              }}
            >
              <li>ESC 키로 닫기</li>
              <li>오버레이 클릭으로 닫기</li>
              <li>포커스 관리 (접근성)</li>
              <li>스크롤 방지</li>
              <li>4가지 크기 (sm, md, lg, xl)</li>
              <li>애니메이션 효과</li>
            </ul>
          </div>

          <div style={{ marginBottom: currentTheme.spacing["4"] }}>
            <h4
              style={{
                fontSize: currentTheme.typography.fontSize.base,
                fontWeight: currentTheme.typography.fontWeight.medium,
                color: currentTheme.colors.text.primary,
                marginBottom: currentTheme.spacing["3"],
              }}
            >
              🧩 컴포넌트 테스트
            </h4>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: currentTheme.spacing["4"],
              }}
            >
              <Checkbox
                label="테마 변경 알림 받기"
                description="새로운 테마로 변경될 때 알림을 받습니다"
                checked={checkboxValue}
                onChange={(e) => setCheckboxValue(e.target.checked)}
                size="md"
              />

              <Select
                label="선호하는 테마"
                placeholder="테마를 선택하세요"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={[
                  { value: "dark", label: "다크 테마" },
                  { value: "light", label: "라이트 테마" },
                  { value: "orange", label: "오렌지 테마" },
                  { value: "pastel", label: "파스텔 테마" },
                ]}
                size="md"
              />
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button onClick={handleCycleTheme} variant="primary">
            테마 변경 테스트
          </Button>
          <Button onClick={() => setShowDialog(false)} variant="secondary">
            닫기
          </Button>
        </DialogFooter>
      </Dialog>

      {/* 확인 Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="⚠️ 모든 데이터 삭제"
        description="정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        size="sm"
      >
        <DialogContent>
          <p
            style={{
              color: currentTheme.colors.text.secondary,
              fontSize: currentTheme.typography.fontSize.sm,
              lineHeight: "1.6",
            }}
          >
            삭제될 데이터:
          </p>
          <ul
            style={{
              color: currentTheme.colors.text.secondary,
              fontSize: currentTheme.typography.fontSize.sm,
              lineHeight: "1.6",
              paddingLeft: currentTheme.spacing["4"],
              marginTop: currentTheme.spacing["2"],
            }}
          >
            <li>계층적 할일 (DB 전체)</li>
            <li>노트 {notes.length}개</li>
            <li>사용자 설정</li>
          </ul>
        </DialogContent>

        <DialogFooter>
          <Button
            onClick={() => {
              handleClearData();
              setShowConfirmDialog(false);
            }}
            variant="primary"
            style={{ backgroundColor: currentTheme.colors.status.error }}
          >
            삭제
          </Button>
          <Button
            onClick={() => setShowConfirmDialog(false)}
            variant="secondary"
          >
            취소
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

// 메인 컴포넌트 - ThemeProvider로 감싸기
export default function DBTestPage() {
  return (
    <ThemeProvider>
      <DBTestContent />
    </ThemeProvider>
  );
}
