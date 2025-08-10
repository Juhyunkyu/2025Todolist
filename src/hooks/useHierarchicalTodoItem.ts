import { useState, useCallback, useEffect } from 'react';
import type { HierarchicalTodo } from '@/components/HierarchicalTodoItem';
import type { DragEndEvent } from '@dnd-kit/core';
import type { Dispatch, SetStateAction } from 'react';
import {
  toggleHierarchicalTodo,
  toggleHierarchicalTodoExpansion,
  updateHierarchicalTodo,
  deleteHierarchicalTodo,
  addHierarchicalTodo,
  getHierarchicalTodosByParent,
  copySingleHierarchicalTodoAsMarkdown,
  reorderHierarchicalTodos,
} from '@/lib/db';

interface UseHierarchicalTodoItemProps {
  todo: HierarchicalTodo;
  onUpdate: () => void;
  level?: number; // 계층 레벨 추가
}

interface UseHierarchicalTodoItemReturn {
  // 상태
  isEditing: boolean;
  editTitle: string;
  isAddingChild: boolean;
  newChildTitle: string;
  children: HierarchicalTodo[];
  isLoading: boolean;
  showActions: boolean;
  error: string | null;
  
  // 핸들러
  handleToggle: () => Promise<void>;
  handleExpansionToggle: () => Promise<void>;
  handleSaveEdit: () => Promise<void>;
  handleCancelEdit: () => void;
  handleAddChild: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleCopyAsMarkdown: () => Promise<{ success: boolean; message: string }>;
  handleChildDragEnd: (event: DragEndEvent) => Promise<void>;
  
  // 상태 설정
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  setEditTitle: Dispatch<SetStateAction<string>>;
  setIsAddingChild: Dispatch<SetStateAction<boolean>>;
  setNewChildTitle: Dispatch<SetStateAction<string>>;
  setShowActions: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
}

const MAX_HIERARCHY_LEVEL = 2; // 최대 2단계까지만 허용

export const useHierarchicalTodoItem = ({ todo, onUpdate, level = 0 }: UseHierarchicalTodoItemProps): UseHierarchicalTodoItemReturn => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState("");
  const [children, setChildren] = useState<HierarchicalTodo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 자식 항목들 로드
  const loadChildren = useCallback(async () => {
    if (todo.children.length > 0 && todo.isExpanded) {
      try {
        const childTodos = await getHierarchicalTodosByParent(todo.id);
        setChildren(childTodos);
      } catch (error) {
        setError("자식 항목을 불러오는데 실패했습니다.");
      }
    }
  }, [todo.id, todo.children.length, todo.isExpanded]);

  // 컴포넌트 마운트 시 자식들 로드
  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  // 체크박스 토글
  const handleToggle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await toggleHierarchicalTodo(todo.id);
      onUpdate();
      await loadChildren();
    } catch (error) {
      setError("상태 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [todo.id, onUpdate, loadChildren]);

  // 접기/펼치기 토글
  const handleExpansionToggle = useCallback(async () => {
    if (todo.children.length === 0) return;

    setError(null);
    try {
      await toggleHierarchicalTodoExpansion(todo.id);
      onUpdate();
    } catch (error) {
      setError("펼치기/접기에 실패했습니다.");
    }
  }, [todo.id, todo.children.length, onUpdate]);

  // 제목 수정 저장
  const handleSaveEdit = useCallback(async () => {
    if (editTitle.trim() === "") return;

    setError(null);
    try {
      await updateHierarchicalTodo(todo.id, { title: editTitle.trim() });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      setError("제목 수정에 실패했습니다.");
    }
  }, [todo.id, editTitle, onUpdate]);

  // 제목 수정 취소
  const handleCancelEdit = useCallback(() => {
    setEditTitle(todo.title);
    setIsEditing(false);
    setError(null);
  }, [todo.title]);

  // 자식 항목 추가
  const handleAddChild = useCallback(async () => {
    if (newChildTitle.trim() === "") return;
    
    // 최대 계층 레벨 체크
    if (level >= MAX_HIERARCHY_LEVEL) {
      setError(`최대 ${MAX_HIERARCHY_LEVEL}단계까지만 하위 항목을 추가할 수 있습니다.`);
      return;
    }

    setError(null);
    try {
      const nextOrder = children.length;
      await addHierarchicalTodo({
        title: newChildTitle.trim(),
        isDone: false,
        parentId: todo.id,
        isExpanded: false,
        order: nextOrder,
        tags: [],
        date: null, // 날짜를 설정하지 않음
        repeat: "none",
      });

      setNewChildTitle("");
      setIsAddingChild(false);
      onUpdate();
      await loadChildren();
    } catch (error) {
      setError("자식 항목 추가에 실패했습니다.");
    }
  }, [newChildTitle, children.length, todo.id, onUpdate, loadChildren, level]);

  // 항목 삭제
  const handleDelete = useCallback(async () => {
    if (
      !confirm(
        `"${todo.title}"을(를) 삭제하시겠습니까?${
          todo.children.length > 0 ? " (하위 항목들도 함께 삭제됩니다)" : ""
        }`
      )
    ) {
      return;
    }

    setError(null);
    try {
      await deleteHierarchicalTodo(todo.id);
      onUpdate();
    } catch (error) {
      setError("삭제에 실패했습니다.");
    }
  }, [todo.id, todo.title, todo.children.length, onUpdate]);

  // 개별 항목 복사
  const handleCopyAsMarkdown = useCallback(async () => {
    setError(null);
    try {
      const markdown = await copySingleHierarchicalTodoAsMarkdown(todo.id);
      await navigator.clipboard.writeText(markdown);
      return { success: true, message: "복사되었습니다!" };
    } catch (error) {
      setError("복사에 실패했습니다.");
      return { success: false, message: "복사에 실패했습니다." };
    }
  }, [todo.id]);

  // 하위 항목 드래그 종료 핸들러
  const handleChildDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const activeIndex = children.findIndex((child) => child.id === String(active.id));
      const overIndex = children.findIndex((child) => child.id === String(over.id));

      if (activeIndex !== -1 && overIndex !== -1) {
        const newChildren = children.map((child, index) => {
          if (index === activeIndex) return children[overIndex];
          if (index === overIndex) return children[activeIndex];
          return child;
        });
        setChildren(newChildren);

        try {
          const newOrder = newChildren.map((child) => child.id);
          await reorderHierarchicalTodos(todo.id, newOrder);
          onUpdate();
        } catch (error) {
          setError("순서 변경에 실패했습니다.");
          await loadChildren();
        }
      }
    },
    [children, todo.id, onUpdate, loadChildren]
  );

  return {
    // 상태
    isEditing,
    editTitle,
    isAddingChild,
    newChildTitle,
    children,
    isLoading,
    showActions,
    error,
    
    // 핸들러
    handleToggle,
    handleExpansionToggle,
    handleSaveEdit,
    handleCancelEdit,
    handleAddChild,
    handleDelete,
    handleCopyAsMarkdown,
    handleChildDragEnd,
    
    // 상태 설정
    setIsEditing,
    setEditTitle,
    setIsAddingChild,
    setNewChildTitle,
    setShowActions,
    setError,
  };
};
