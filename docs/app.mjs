const el = id => document.getElementById(id);
function show(value) { el("result").textContent = value; }
function appendText(value) {
  const p = document.createElement("p"); p.textContent = value; el("result").append(p);
}
function action(callback) {
  const button = el("run");
  button.onclick = async () => {
    button.disabled = true;
    try { await callback(); } catch (error) { show(error.message); }
    finally { button.disabled = false; }
  };
}
function renderTable(rows) {
  const wrapper = document.createElement("div"), table = document.createElement("table");
  wrapper.className = "grid";
  rows.forEach((row,index) => {
    const tr = table.insertRow();
    row.forEach(value => {
      const cell = document.createElement(index ? "td" : "th");
      cell.textContent = String(value);
      if (!index) cell.scope = "col";
      tr.append(cell);
    });
  });
  wrapper.append(table); el("result").append(wrapper);
}
let previousUrl;
function download(filename, contents, type = "text/csv") {
  if (previousUrl) URL.revokeObjectURL(previousUrl);
  previousUrl = URL.createObjectURL(new Blob([contents],{type}));
  const link = document.createElement("a");
  link.className = "download"; link.href = previousUrl;
  link.download = filename; link.textContent = "Download " + filename;
  el("result").append(link);
}
import {readTasks, changeTask} from "./tool.mjs";
const key = "task-raft-v1";
let tasks = [];
try { tasks = readTasks(localStorage.getItem(key)); } catch {}
function draw() {
  const mode = el("filter").value;
  const list = document.createElement("ul");
  list.className = "tasks";
  for (const task of tasks) {
    if ((mode === "done" && !task.done) || (mode === "open" && task.done)) continue;
    const item = document.createElement("li"), check = document.createElement("input"), title = document.createElement("input"), remove = document.createElement("button");
    check.type = "checkbox"; check.checked = task.done; check.setAttribute("aria-label","Completed: " + task.title);
    title.value = task.title; title.maxLength = 160; title.setAttribute("aria-label","Edit: "+task.title);
    check.onchange = () => commit({type:"toggle",id:task.id});
    title.onchange = () => { if (!title.value.trim()) title.value = task.title; commit({type:"edit",id:task.id,title:title.value}); };
    remove.textContent = "Delete"; remove.className = "quiet"; remove.setAttribute("aria-label","Delete: " + task.title);
    remove.onclick = () => commit({type:"delete",id:task.id});
    item.append(check,title,remove); list.append(item);
  }
  el("result").replaceChildren(list);
  const count = tasks.filter(task => !task.done).length;
  const summary = document.createElement("p");
  summary.textContent = count + " open " + (count === 1 ? "task" : "tasks") + (list.children.length ? "" : " · No tasks in this view.");
  el("result").prepend(summary);
  if (tasks.length) {
    const progress = document.createElement("progress");
    progress.className = "task-progress";
    progress.max = tasks.length;
    progress.value = tasks.length - count;
    progress.setAttribute("aria-label", (tasks.length - count) + " of " + tasks.length + " tasks completed");
    summary.append(progress);
  }
  if (tasks.length) {
    const progress = document.createElement("progress");
    progress.className = "task-progress";
    progress.max = tasks.length;
    progress.value = tasks.length - count;
    progress.setAttribute("aria-label", (tasks.length - count) + " of " + tasks.length + " tasks completed");
    summary.append(progress);
  }
}
function commit(action) {
  tasks = changeTask(tasks, action);
  draw();
  try { localStorage.setItem(key,JSON.stringify(tasks)); } catch {
    const note = document.createElement("p"); note.textContent = "Browser storage is unavailable. Changes last until reload.";
    el("result").prepend(note);
  }
}
function submit() {
  if (!el("title").value.trim()) { el("title").focus(); return; }
  commit({type:"add",id:crypto.randomUUID(),title:el("title").value});
  el("title").value = "";
  el("title").focus();
}
el("run").onclick = submit;
el("title").onkeydown = event => { if (event.key === "Enter") submit(); };
el("filter").onchange = draw;
el("example").onclick = () => {
  for (const title of ["Draft release notes","Check mobile layout","Share the demo"]) {
    if (!tasks.some(task => task.title === title)) commit({type:"add",id:crypto.randomUUID(),title});
  }
};
draw();
