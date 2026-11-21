const inputPanel = document.querySelector(".panel");
const result = document.getElementById("result");
const status = document.getElementById("result-status");
const run = document.getElementById("run");
const sample = document.getElementById("sample") || document.getElementById("example");
const slug = document.documentElement.dataset.app;
const editors = [...inputPanel.querySelectorAll("textarea, input[type=password]")];
const primaryText = inputPanel.querySelector("textarea, input[type=text], #title");
const tools = document.createElement("div");
tools.className = "editor-tools";
const count = document.createElement("span");
const resultsLink = document.createElement("a");
resultsLink.href = "#output-panel";
resultsLink.textContent = "View results ↓";
resultsLink.addEventListener("click", () => {
  document.querySelector("#output-panel h2").focus({preventScroll:true});
});
tools.append(count, resultsLink);
inputPanel.append(tools);
function updateCount() {
  const length = editors.length
    ? editors.filter(editor => editor.type !== "password").reduce((total, editor) => total + editor.value.length, 0)
    : primaryText?.value.length || 0;
  count.textContent = length.toLocaleString() + " characters in editor";
}
function markChanged() {
  updateCount();
  status.textContent = slug === "task-raft" || slug === "speechfield"
    ? "Editing"
    : "Inputs changed · run again to update results";
}
if (editors.length || primaryText) {
  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "quiet";
  clear.textContent = "Clear editor";
  clear.addEventListener("click", () => {
    const fields = editors.length ? editors : [primaryText];
    for (const field of fields) field.value = "";
    // Notify existing input handlers, including editable speech fields.
    for (const field of fields) field.dispatchEvent(new Event("input", {bubbles:true}));
    updateCount();
    status.textContent = "Editor cleared";
    (editors[0] || primaryText).focus();
  });
  tools.append(clear);
}
inputPanel.addEventListener("input", markChanged);
inputPanel.addEventListener("change", updateCount);
sample?.addEventListener("click", () => queueMicrotask(() => {
  updateCount();
  if (slug !== "task-raft" && slug !== "speechfield") {
    status.textContent = "Example loaded · ready to run";
  }
}));
new MutationObserver(() => {
  status.textContent = "Result updated";
  updateCount();
}).observe(result, {childList:true, subtree:true, characterData:true});
if (slug !== "speechfield") {
  run.title = "Run current inputs with Ctrl+Enter or Command+Enter";
  const hint = document.createElement("span");
  hint.className = "shortcut";
  hint.textContent = "Ctrl / ⌘ + Enter";
  tools.append(hint);
  inputPanel.addEventListener("keydown", event => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && !event.repeat) {
      event.preventDefault();
      if (!run.disabled) run.click();
    }
  });
}
updateCount();
