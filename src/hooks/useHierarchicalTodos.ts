import { useState, useCallback, useEffect } from 'react';
import type { HierarchicalTodo } from '@/components/HierarchicalTodoItem';
import {
  getHierarchicalTodosByParent,
  addHierarchicalTodo,
  getHierarchicalTodoProgress,
  reorderHierarchicalTodos,
  expandAllHierarchicalTodos,
} from '@/lib/db';

interface TodoState {
  todos: HierarchicalTodo[];
  isLoading: boolean;
  error: string | null;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

interface UseHierarchicalTodosProps {
  externalTodos?: HierarchicalTodo[];
  onUpdate?: () => void;
}

export const useHierarchicalTodos = ({ externalTodos, onUpdate }: UseHierarchicalTodosProps = {}) => {
  const [state, setState] = useState<TodoState>({
    todos: [],
    isLoading: true,
    error: null,
    progress: { completed: 0, total: 0, percentage: 0 },
  });

  // 할일 목록 로드
  const loadTodos = useCallback(async () => {
    if (externalTodos) {
      setState(prev => ({ ...prev, todos: externalTodos, isLoading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const rootTodos = await getHierarchicalTodosByParent();
      setState(prev => ({ ...prev, todos: rootTodos, isLoading: false }));
    } catch (error) {
      console.error('Failed to load hierarchical todos:', error);
      setState(prev => ({ 
        ...prev, 
        error: '할일 목록을 불러오는데 실패했습니다.',
        isLoading: false 
      }));
    }
  }, [externalTodos]);

  // 진행률 계산
  const calculateProgress = useCallback(async () => {
    if (state.todos.length === 0) return;

    try {
      const progressData = await getHierarchicalTodoProgress();
      setState(prev => ({ ...prev, progress: progressData }));
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }, [state.todos.length]);

  // 새 할일 추가
  const addTodo = useCallback(async (title: string) => {
    if (title.trim() === '') return { success: false, message: '제목을 입력해주세요.' };

    try {
      const nextOrder = state.todos.length;
      await addHierarchicalTodo({
        title: title.trim(),
        isDone: false,
        isExpanded: false,
        order: nextOrder,
        tags: [],
        date: new Date().toISOString(),
        repeat: 'none',
      });

      if (onUpdate) {
        onUpdate();
      } else {
        await loadTodos();
      }
      return { success: true, message: '새 할일이 추가되었습니다.' };
    } catch (error) {
      console.error('Failed to add todo:', error);
      return { success: false, message: '할일 추가에 실패했습니다.' };
    }
  }, [state.todos.length, onUpdate, loadTodos]);

  // 전체 펼치기/접기
  const expandAll = useCallback(async (expand: boolean) => {
    try {
      setState(prev => ({ ...prev, todos: prev.todos.map(todo => ({ ...todo, isExpanded: expand })) }));
      
      await expandAllHierarchicalTodos(expand);
      const refreshedTodos = await getHierarchicalTodosByParent();
      setState(prev => ({ ...prev, todos: refreshedTodos }));
      
      return { success: true, message: `모든 할일이 ${expand ? '펼쳐졌습니다' : '접혀졌습니다'}!` };
    } catch (error) {
      console.error('Failed to expand all todos:', error);
      return { success: false, message: '저장에 실패했습니다. 다시 시도해주세요.' };
    }
  }, []);

  // 순서 변경
  const reorderTodos = useCallback(async (newOrder: string[]) => {
    try {
      await reorderHierarchicalTodos(undefined, newOrder);
      if (onUpdate) {
        onUpdate();
      } else {
        await loadTodos();
      }
      return { success: true, message: '순서가 변경되었습니다!' };
    } catch (error) {
      console.error('Failed to reorder todos:', error);
      return { success: false, message: '순서 변경에 실패했습니다.' };
    }
  }, [onUpdate, loadTodos]);

  // 컴포넌트 마운트 시 로드
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // 진행률 계산
  useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);

  return {
    ...state,
    loadTodos,
    addTodo,
    expandAll,
    reorderTodos,
    clearError: () => setState(prev => ({ ...prev, error: null })),
  };
};
