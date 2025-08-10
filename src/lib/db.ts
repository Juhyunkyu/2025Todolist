import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ========================
// 데이터베이스 스키마 정의
// ========================

interface TodoPlannerDB extends DBSchema {
  todos: {
    key: string;
    value: {
      id: string;
      title: string;
      isDone: boolean;
      tags: string[];
      date: string; // ISO string
      repeat: 'none' | 'daily' | 'weekly' | 'monthly';
      alarmTime?: string;
      createdAt: string;
      updatedAt: string;
    };
    indexes: {
      'by-date': string;
      'by-tags': string;
    };
  };
  hierarchicalTodos: {
    key: string;
    value: {
      id: string;
      title: string;
      isDone: boolean;
      parentId?: string;     // 부모 ID (없으면 최상위)
      children: string[];    // 자식 ID 배열
      isExpanded: boolean;   // 펼침/접힘 상태
      order: number;         // 정렬 순서
      tags: string[];
      date: string;
      repeat: 'none' | 'daily' | 'weekly' | 'monthly';
      alarmTime?: string;
      createdAt: string;
      updatedAt: string;
    };
    indexes: {
      'by-parent': string;
      'by-date': string;
      'by-tags': string;
    };
  };
  notes: {
    key: string;
    value: {
      id: string;
      title: string;
      content: string;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    };
    indexes: {
      'by-date': string;
      'by-tags': string;
    };
  };
  birthdays: {
    key: string;
    value: {
      id: string;
      name: string;
      date: string; // MM-DD format
      year?: number;
      createdAt: string;
      updatedAt: string;
    };
    indexes: {
      'by-date': string;
    };
  };
  templates: {
    key: string;
    value: {
      id: string;
      name: string;
      todos: Array<{
        title: string;
        tags: string[];
      }>;
      createdAt: string;
      updatedAt: string;
    };
  };
  settings: {
    key: string;
    value: {
      theme: 'dark' | 'light' | 'orange' | 'pastel' | 'purple' | 'gray' | 'gray-dark';
      notifications: boolean;
      autoBackup: boolean;
      lastBackup?: string;
    };
  };
}

// ========================
// 공통 유틸리티 함수들
// ========================

// 공통 필드 생성 (중복 코드 제거)
function createCommonFields<T extends { id?: string; createdAt?: string; updatedAt?: string }>(
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): T {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  
  return {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  } as T;
}

// 트랜잭션 래퍼 (Supabase 연동 시 유용)
async function withTransaction<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}

// ========================
// 데이터베이스 인스턴스
// ========================

let db: IDBPDatabase<TodoPlannerDB> | null = null;

// 데이터베이스 초기화
export async function initDB(): Promise<IDBPDatabase<TodoPlannerDB>> {
  if (db) return db;

  db = await openDB<TodoPlannerDB>('todo-planner', 2, {
    upgrade(db, oldVersion) {
      // Todos 스토어 (기존)
      if (oldVersion < 1) {
        const todosStore = db.createObjectStore('todos', { keyPath: 'id' });
        todosStore.createIndex('by-date', 'date');
        todosStore.createIndex('by-tags', 'tags');

        // Notes 스토어
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('by-date', 'createdAt');
        notesStore.createIndex('by-tags', 'tags');

        // Birthdays 스토어
        const birthdaysStore = db.createObjectStore('birthdays', { keyPath: 'id' });
        birthdaysStore.createIndex('by-date', 'date');

        // Templates 스토어
        db.createObjectStore('templates', { keyPath: 'id' });

        // Settings 스토어
        db.createObjectStore('settings', { keyPath: 'id' });
      }

      // 계층적 할일 스토어 (v2에서 추가)
      if (oldVersion < 2) {
        const hierarchicalTodosStore = db.createObjectStore('hierarchicalTodos', { keyPath: 'id' });
        hierarchicalTodosStore.createIndex('by-parent', 'parentId');
        hierarchicalTodosStore.createIndex('by-date', 'date');
        hierarchicalTodosStore.createIndex('by-tags', 'tags');
      }
    },
  });

  return db;
}

// Helper 함수들
export async function getDB(): Promise<IDBPDatabase<TodoPlannerDB>> {
  return await initDB();
}

// ========================
// 개선된 CRUD 함수들
// ========================

// Todos CRUD
export async function addTodo(todo: Omit<TodoPlannerDB['todos']['value'], 'id' | 'createdAt' | 'updatedAt'>) {
  return await withTransaction(async () => {
    const db = await getDB();
    const newTodo = createCommonFields<TodoPlannerDB['todos']['value']>(todo);
    await db.add('todos', newTodo);
    return newTodo;
  });
}

export async function getTodos(): Promise<TodoPlannerDB['todos']['value'][]> {
  return await withTransaction(async () => {
    const db = await getDB();
    return await db.getAll('todos');
  });
}

export async function getTodoById(id: string): Promise<TodoPlannerDB['todos']['value'] | undefined> {
  return await withTransaction(async () => {
    const db = await getDB();
    return await db.get('todos', id);
  });
}

export async function updateTodo(id: string, updates: Partial<TodoPlannerDB['todos']['value']>) {
  return await withTransaction(async () => {
    const db = await getDB();
    const todo = await db.get('todos', id);
    if (!todo) throw new Error('Todo not found');

    const updatedTodo: TodoPlannerDB['todos']['value'] = {
      ...todo,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.put('todos', updatedTodo);
    return updatedTodo;
  });
}

export async function deleteTodo(id: string) {
  return await withTransaction(async () => {
    const db = await getDB();
    await db.delete('todos', id);
  });
}

export async function toggleTodo(id: string) {
  return await withTransaction(async () => {
    const todo = await getTodoById(id);
    if (!todo) throw new Error('Todo not found');
    return await updateTodo(id, { isDone: !todo.isDone });
  });
}

// Notes CRUD
export async function addNote(note: Omit<TodoPlannerDB['notes']['value'], 'id' | 'createdAt' | 'updatedAt'>) {
  return await withTransaction(async () => {
    const db = await getDB();
    const newNote = createCommonFields<TodoPlannerDB['notes']['value']>(note);
    await db.add('notes', newNote);
    return newNote;
  });
}

export async function getNotes(): Promise<TodoPlannerDB['notes']['value'][]> {
  return await withTransaction(async () => {
    const db = await getDB();
    return await db.getAll('notes');
  });
}

export async function updateNote(id: string, updates: Partial<TodoPlannerDB['notes']['value']>) {
  return await withTransaction(async () => {
    const db = await getDB();
    const note = await db.get('notes', id);
    if (!note) throw new Error('Note not found');

    const updatedNote: TodoPlannerDB['notes']['value'] = {
      ...note,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.put('notes', updatedNote);
    return updatedNote;
  });
}

export async function deleteNote(id: string) {
  return await withTransaction(async () => {
    const db = await getDB();
    await db.delete('notes', id);
  });
}

// Birthdays CRUD
export async function addBirthday(birthday: Omit<TodoPlannerDB['birthdays']['value'], 'id' | 'createdAt' | 'updatedAt'>) {
  return await withTransaction(async () => {
    const db = await getDB();
    const newBirthday = createCommonFields<TodoPlannerDB['birthdays']['value']>(birthday);
    await db.add('birthdays', newBirthday);
    return newBirthday;
  });
}

export async function getBirthdays(): Promise<TodoPlannerDB['birthdays']['value'][]> {
  return await withTransaction(async () => {
    const db = await getDB();
    return await db.getAll('birthdays');
  });
}

export async function updateBirthday(id: string, updates: Partial<TodoPlannerDB['birthdays']['value']>) {
  return await withTransaction(async () => {
    const db = await getDB();
    const birthday = await db.get('birthdays', id);
    if (!birthday) throw new Error('Birthday not found');

    const updatedBirthday: TodoPlannerDB['birthdays']['value'] = {
      ...birthday,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.put('birthdays', updatedBirthday);
    return updatedBirthday;
  });
}

export async function deleteBirthday(id: string) {
  return await withTransaction(async () => {
    const db = await getDB();
    await db.delete('birthdays', id);
  });
}

// Templates CRUD
export async function addTemplate(template: Omit<TodoPlannerDB['templates']['value'], 'id' | 'createdAt' | 'updatedAt'>) {
  return await withTransaction(async () => {
    const db = await getDB();
    const newTemplate = createCommonFields<TodoPlannerDB['templates']['value']>(template);
    await db.add('templates', newTemplate);
    return newTemplate;
  });
}

export async function getTemplates(): Promise<TodoPlannerDB['templates']['value'][]> {
  return await withTransaction(async () => {
    const db = await getDB();
    return await db.getAll('templates');
  });
}

export async function updateTemplate(id: string, updates: Partial<TodoPlannerDB['templates']['value']>) {
  return await withTransaction(async () => {
    const db = await getDB();
    const template = await db.get('templates', id);
    if (!template) throw new Error('Template not found');

    const updatedTemplate: TodoPlannerDB['templates']['value'] = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.put('templates', updatedTemplate);
    return updatedTemplate;
  });
}

export async function deleteTemplate(id: string) {
  return await withTransaction(async () => {
    const db = await getDB();
    await db.delete('templates', id);
  });
}

// Settings
export async function getSettings(): Promise<TodoPlannerDB['settings']['value']> {
  return await withTransaction(async () => {
    const db = await getDB();
    const settings = await db.get('settings', 'default');
    
    if (!settings) {
      // 기본 설정 반환
      const defaultSettings: TodoPlannerDB['settings']['value'] = {
        theme: 'dark',
        notifications: true,
        autoBackup: false,
      };
      await db.add('settings', defaultSettings);
      return defaultSettings;
    }
    
    return settings;
  });
}

export async function updateSettings(updates: Partial<TodoPlannerDB['settings']['value']>) {
  return await withTransaction(async () => {
    const db = await getDB();
    const settings = await db.get('settings', 'default');
    
    const updatedSettings: TodoPlannerDB['settings']['value'] = {
      theme: 'dark',
      notifications: true,
      autoBackup: false,
      ...settings,
      ...updates,
    };

    await db.put('settings', updatedSettings);
    return updatedSettings;
  });
}

// ========================
// 유틸리티 함수들
// ========================

export async function clearAllData() {
  return await withTransaction(async () => {
    const db = await getDB();
    await db.clear('todos');
    await db.clear('notes');
    await db.clear('birthdays');
    await db.clear('templates');
    await db.clear('settings');
  });
}

export async function exportData() {
  return await withTransaction(async () => {
    const todos = await getTodos();
    const notes = await getNotes();
    const birthdays = await getBirthdays();
    const templates = await getTemplates();
    const settings = await getSettings();

    return {
      todos,
      notes,
      birthdays,
      templates,
      settings,
      exportedAt: new Date().toISOString(),
    };
  });
}

export async function importData(data: Awaited<ReturnType<typeof exportData>>) {
  return await withTransaction(async () => {
    const db = await getDB();
    
    // 기존 데이터 삭제
    await clearAllData();
    
    // 새 데이터 추가
    for (const todo of data.todos) {
      await db.add('todos', todo);
    }
    
    for (const note of data.notes) {
      await db.add('notes', note);
    }
    
    for (const birthday of data.birthdays) {
      await db.add('birthdays', birthday);
    }
    
    for (const template of data.templates) {
      await db.add('templates', template);
    }
    
    await db.put('settings', data.settings);
  });
}

// ========================
// 계층적 할일 CRUD 함수들
// ========================

export async function addHierarchicalTodo(todo: Omit<TodoPlannerDB['hierarchicalTodos']['value'], 'id' | 'createdAt' | 'updatedAt' | 'children'>) {
  return await withTransaction(async () => {
    const db = await getDB();
    const newTodo = createCommonFields<TodoPlannerDB['hierarchicalTodos']['value']>({
      ...todo,
      children: [],
    });
    
    await db.add('hierarchicalTodos', newTodo);

    // 부모가 있다면 부모의 children 배열에 추가
    if (todo.parentId) {
      await addChildToParent(todo.parentId, newTodo.id);
    }

    return newTodo;
  });
}

export async function getHierarchicalTodos(): Promise<TodoPlannerDB['hierarchicalTodos']['value'][]> {
  return await withTransaction(async () => {
    const db = await getDB();
    return await db.getAll('hierarchicalTodos');
  });
}

export async function getHierarchicalTodoById(id: string): Promise<TodoPlannerDB['hierarchicalTodos']['value'] | undefined> {
  return await withTransaction(async () => {
    const db = await getDB();
    return await db.get('hierarchicalTodos', id);
  });
}

// 성능 최적화된 부모별 조회
export async function getHierarchicalTodosByParent(parentId?: string): Promise<TodoPlannerDB['hierarchicalTodos']['value'][]> {
  return await withTransaction(async () => {
    const db = await getDB();
    if (parentId === undefined) {
      // 최상위 항목들만 조회 (인덱스 활용)
      const allTodos = await db.getAll('hierarchicalTodos');
      return allTodos.filter(todo => !todo.parentId).sort((a, b) => a.order - b.order);
    }
    
    // 인덱스를 활용한 효율적인 조회
    const todos = await db.getAllFromIndex('hierarchicalTodos', 'by-parent', parentId);
    return todos.sort((a, b) => a.order - b.order);
  });
}

export async function updateHierarchicalTodo(id: string, updates: Partial<TodoPlannerDB['hierarchicalTodos']['value']>) {
  return await withTransaction(async () => {
    const db = await getDB();
    const todo = await db.get('hierarchicalTodos', id);
    if (!todo) throw new Error('Hierarchical Todo not found');

    const updatedTodo: TodoPlannerDB['hierarchicalTodos']['value'] = {
      ...todo,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.put('hierarchicalTodos', updatedTodo);
    return updatedTodo;
  });
}

export async function deleteHierarchicalTodo(id: string) {
  return await withTransaction(async () => {
    const db = await getDB();
    const todo = await db.get('hierarchicalTodos', id);
    if (!todo) throw new Error('Hierarchical Todo not found');

    // 자식 항목들도 재귀적으로 삭제
    for (const childId of todo.children) {
      await deleteHierarchicalTodo(childId);
    }

    // 부모의 children 배열에서 제거
    if (todo.parentId) {
      await removeChildFromParent(todo.parentId, id);
    }

    await db.delete('hierarchicalTodos', id);
  });
}

export async function toggleHierarchicalTodo(id: string) {
  return await withTransaction(async () => {
    const todo = await getHierarchicalTodoById(id);
    if (!todo) throw new Error('Hierarchical Todo not found');

    const newIsDone = !todo.isDone;
    await updateHierarchicalTodo(id, { isDone: newIsDone });

    // 자식들의 상태도 동기화
    if (todo.children.length > 0) {
      for (const childId of todo.children) {
        await updateHierarchicalTodo(childId, { isDone: newIsDone });
      }
    }

    // 부모의 상태 업데이트 (모든 자식이 완료되면 부모도 완료)
    if (todo.parentId) {
      await updateParentStatus(todo.parentId);
    }

    return await getHierarchicalTodoById(id);
  });
}

export async function toggleHierarchicalTodoExpansion(id: string) {
  return await withTransaction(async () => {
    const todo = await getHierarchicalTodoById(id);
    if (!todo) throw new Error('Hierarchical Todo not found');

    return await updateHierarchicalTodo(id, { isExpanded: !todo.isExpanded });
  });
}

// ========================
// Helper 함수들
// ========================

async function addChildToParent(parentId: string, childId: string) {
  const parent = await getHierarchicalTodoById(parentId);
  if (!parent) throw new Error('Parent todo not found');

  const updatedChildren = [...parent.children, childId];
  await updateHierarchicalTodo(parentId, { children: updatedChildren });
}

async function removeChildFromParent(parentId: string, childId: string) {
  const parent = await getHierarchicalTodoById(parentId);
  if (!parent) throw new Error('Parent todo not found');

  const updatedChildren = parent.children.filter(id => id !== childId);
  await updateHierarchicalTodo(parentId, { children: updatedChildren });
}

async function updateParentStatus(parentId: string) {
  const parent = await getHierarchicalTodoById(parentId);
  if (!parent) return;

  if (parent.children.length === 0) return;

  // 모든 자식의 상태 확인
  const childrenStatus = await Promise.all(
    parent.children.map(async (childId) => {
      const child = await getHierarchicalTodoById(childId);
      return child?.isDone ?? false;
    })
  );

  // 부모의 상태는 모든 자식이 완료되었는지에만 의존
  const allChildrenDone = childrenStatus.every(status => status);
  
  // 부모의 현재 상태와 자식들의 완료 상태가 다르면 동기화
  if (parent.isDone !== allChildrenDone) {
    await updateHierarchicalTodo(parentId, { isDone: allChildrenDone });
  }

  // 부모의 부모도 재귀적으로 업데이트
  if (parent.parentId) {
    await updateParentStatus(parent.parentId);
  }
}

// ========================
// 마크다운 복사 함수들
// ========================

export async function copyHierarchicalTodosAsMarkdown(): Promise<string> {
  return await withTransaction(async () => {
    const rootTodos = await getHierarchicalTodosByParent();
    
    const formatTodo = async (todo: TodoPlannerDB['hierarchicalTodos']['value'], level: number = 0): Promise<string> => {
      const indent = '  '.repeat(level);
      const checkbox = todo.isDone ? '☑️' : '⬜';
      let result = `${indent}- ${checkbox} ${todo.title}\n`;
      
      if (todo.children.length > 0) {
        for (const childId of todo.children) {
          const child = await getHierarchicalTodoById(childId);
          if (child) {
            result += await formatTodo(child, level + 1);
          }
        }
      }
      
      return result;
    };

    let markdown = '# 할일 목록\n\n';
    for (const todo of rootTodos) {
      markdown += await formatTodo(todo);
    }
    
    return markdown;
  });
}

export async function copySingleHierarchicalTodoAsMarkdown(todoId: string): Promise<string> {
  return await withTransaction(async () => {
    const todo = await getHierarchicalTodoById(todoId);
    if (!todo) throw new Error('Todo not found');
    
    const formatTodo = async (todo: TodoPlannerDB['hierarchicalTodos']['value'], level: number = 0): Promise<string> => {
      const indent = '  '.repeat(level);
      const checkbox = todo.isDone ? '☑️' : '⬜';
      let result = `${indent}- ${checkbox} ${todo.title}\n`;
      
      if (todo.children.length > 0) {
        for (const childId of todo.children) {
          const child = await getHierarchicalTodoById(childId);
          if (child) {
            result += await formatTodo(child, level + 1);
          }
        }
      }
      
      return result;
    };

    return await formatTodo(todo);
  });
}

// ========================
// 진행률 계산 함수
// ========================

export async function getHierarchicalTodoProgress(parentId?: string): Promise<{ completed: number; total: number; percentage: number }> {
  return await withTransaction(async () => {
    const todos = await getHierarchicalTodosByParent(parentId);
    
    let completed = 0;
    let total = 0;
    
    const countProgress = async (todo: TodoPlannerDB['hierarchicalTodos']['value']): Promise<{ completed: number; total: number }> => {
      if (todo.children.length === 0) {
        // 리프 노드만 카운트
        return { completed: todo.isDone ? 1 : 0, total: 1 };
      } else {
        // 자식들의 진행률 합계
        let childCompleted = 0;
        let childTotal = 0;
        
        for (const childId of todo.children) {
          const child = await getHierarchicalTodoById(childId);
          if (child) {
            const childProgress = await countProgress(child);
            childCompleted += childProgress.completed;
            childTotal += childProgress.total;
          }
        }
        
        return { completed: childCompleted, total: childTotal };
      }
    };
    
    for (const todo of todos) {
      const progress = await countProgress(todo);
      completed += progress.completed;
      total += progress.total;
    }
    
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  });
}

// ========================
// 순서 변경 함수들
// ========================

export async function reorderHierarchicalTodos(parentId: string | undefined, newOrder: string[]) {
  return await withTransaction(async () => {
    // 각 항목의 order를 새로운 순서에 맞게 업데이트
    for (let i = 0; i < newOrder.length; i++) {
      const todoId = newOrder[i];
      await updateHierarchicalTodo(todoId, { order: i });
    }
    
    // 부모의 children 배열도 업데이트
    if (parentId) {
      await updateHierarchicalTodo(parentId, { children: newOrder });
    }
  });
}

export async function moveHierarchicalTodo(todoId: string, direction: 'up' | 'down') {
  return await withTransaction(async () => {
    const todo = await getHierarchicalTodoById(todoId);
    if (!todo) throw new Error('Todo not found');
    
    // 같은 레벨의 형제 항목들 가져오기
    const siblings = await getHierarchicalTodosByParent(todo.parentId);
    const currentIndex = siblings.findIndex(sibling => sibling.id === todoId);
    
    if (currentIndex === -1) return false; // 항목을 찾을 수 없음
    
    let newIndex: number;
    if (direction === 'up') {
      newIndex = Math.max(0, currentIndex - 1);
    } else {
      newIndex = Math.min(siblings.length - 1, currentIndex + 1);
    }
    
    if (newIndex === currentIndex) return false; // 이동할 곳이 없음
    
    // 배열에서 위치 바꾸기
    const newOrder = [...siblings];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    
    // 새로운 순서로 저장
    await reorderHierarchicalTodos(todo.parentId, newOrder.map(t => t.id));
    
    return true; // 성공적으로 이동
  });
}

// ========================
// 펼치기/접기 함수들
// ========================

export async function expandAllHierarchicalTodos(expand: boolean) {
  return await withTransaction(async () => {
    // 재귀적으로 모든 할일 업데이트
    async function updateAllTodos(parentId?: string): Promise<void> {
      const todos = await getHierarchicalTodosByParent(parentId);
      
      for (const todo of todos) {
        // 현재 할일 업데이트
        await updateHierarchicalTodo(todo.id, { 
          isExpanded: expand,
          updatedAt: new Date().toISOString()
        });
        
        // 자식이 있으면 자식들도 업데이트
        if (todo.children.length > 0) {
          await updateAllTodos(todo.id);
        }
      }
    }
    
    await updateAllTodos(); // 최상위부터 시작
  });
}

export async function checkAllExpanded() {
  return await withTransaction(async () => {
    try {
      const todos = await getHierarchicalTodos();
      
      // 자식이 있는 할일들만 확인 (자식이 없으면 펼치기/접기가 의미 없음)
      const todosWithChildren = todos.filter(todo => todo.children && todo.children.length > 0);
      
      if (todosWithChildren.length === 0) {
        return false; // 자식이 있는 할일이 없으면 false
      }
      
      // 모든 자식이 있는 할일이 펼쳐져 있으면 true
      return todosWithChildren.every(todo => todo.isExpanded);
    } catch (error) {
      console.error('checkAllExpanded error:', error);
      return false; // 에러 시 기본값 반환
    }
  });
}

// ========================
// Supabase 연동을 위한 준비 함수들
// ========================

// 마이그레이션 함수 (IndexedDB → Supabase)
export async function migrateToSupabase(): Promise<boolean> {
  try {
    console.log('🔄 Supabase 마이그레이션 시작...');
    
    // 1. IndexedDB에서 모든 데이터 export
    const data = await exportData();
    console.log('📤 IndexedDB 데이터 export 완료:', Object.keys(data));
    
    // 2. Supabase 어댑터 생성 (나중에 구현)
    // const supabaseAdapter = new SupabaseAdapter();
    
    // 3. Supabase에 데이터 import
    // await supabaseAdapter.importData(data);
    
    // 4. 어댑터 교체
    // setDatabaseAdapter(supabaseAdapter);
    
    console.log('✅ Supabase 마이그레이션 완료!');
    return true;
  } catch (error) {
    console.error('❌ Supabase 마이그레이션 실패:', error);
    return false;
  }
}

// 마이그레이션 상태 확인
export async function checkMigrationStatus(): Promise<{
  isMigrated: boolean;
  lastMigration?: string;
  dataSize: number;
}> {
  try {
    const settings = await getSettings();
    const data = await exportData();
    
    return {
      isMigrated: settings.lastBackup !== undefined,
      lastMigration: settings.lastBackup,
      dataSize: JSON.stringify(data).length,
    };
  } catch (error) {
    console.error('마이그레이션 상태 확인 실패:', error);
    return {
      isMigrated: false,
      dataSize: 0,
    };
  }
}

