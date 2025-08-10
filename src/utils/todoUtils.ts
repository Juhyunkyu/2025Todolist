import type { HierarchicalTodo } from '@/components/HierarchicalTodoItem';

// 날짜별로 그룹화된 할일 목록 생성
export const groupTodosByDate = (todos: HierarchicalTodo[]) => {
  const groups: { [key: string]: HierarchicalTodo[] } = {};

  todos.forEach((todo) => {
    const date = todo.date || 'no-date';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(todo);
  });

  // 날짜별로 정렬 (최신 날짜가 위로)
  return Object.entries(groups)
    .sort(([a], [b]) => {
      if (a === 'no-date') return 1;
      if (b === 'no-date') return -1;
      return new Date(b).getTime() - new Date(a).getTime();
    })
    .map(([date, todos]) => ({
      date,
      todos: todos.sort((a, b) => a.order - b.order),
    }));
};

// 날짜 포맷팅
export const formatDate = (dateString: string): string => {
  if (dateString === 'no-date') return '';

  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}.${day.toString().padStart(2, '0')}`;
};

// 진행률 계산
export const calculateProgress = (todos: HierarchicalTodo[]): {
  completed: number;
  total: number;
  percentage: number;
} => {
  const total = todos.length;
  const completed = todos.filter(todo => todo.isDone).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
};

// 할일 검색
export const searchTodos = (todos: HierarchicalTodo[], query: string): HierarchicalTodo[] => {
  if (!query.trim()) return todos;

  const searchTerm = query.toLowerCase();
  return todos.filter(todo => 
    todo.title.toLowerCase().includes(searchTerm) ||
    todo.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

// 할일 필터링
export const filterTodos = (
  todos: HierarchicalTodo[], 
  filter: 'all' | 'completed' | 'pending' | 'today'
): HierarchicalTodo[] => {
  switch (filter) {
    case 'completed':
      return todos.filter(todo => todo.isDone);
    case 'pending':
      return todos.filter(todo => !todo.isDone);
    case 'today':
      const today = new Date().toISOString().split('T')[0];
      return todos.filter(todo => todo.date?.startsWith(today));
    default:
      return todos;
  }
};
