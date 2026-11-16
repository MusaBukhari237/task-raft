export function readTasks(raw) {
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    return value.flatMap(task => {
      if (!task || typeof task.id !== "string" || seen.has(task.id) ||
          typeof task.title !== "string" || !task.title.trim() || typeof task.done !== "boolean") return [];
      seen.add(task.id);
      return [{id:task.id, title:task.title.slice(0,160), done:task.done}];
    });
  } catch { return []; }
}
export function changeTask(tasks, action) {
  const title = action.title?.trim().slice(0,160);
  if (action.type === "add" && title && !tasks.some(task => task.id === action.id)) {
    return [...tasks, {id:action.id, title, done:false}];
  }
  if (action.type === "delete") return tasks.filter(task => task.id !== action.id);
  return tasks.map(task => {
    if (task.id !== action.id) return task;
    if (action.type === "toggle") return {...task, done: !task.done};
    if (action.type === "edit" && title) return {...task, title};
    return task;
  });
}
