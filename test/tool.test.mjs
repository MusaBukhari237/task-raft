import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../docs/tool.mjs";

test("task lifecycle and persistent input validation", () => {
  const add=core.changeTask([], {type:"add",id:"a",title:"  Write  "});
  const edited=core.changeTask(add,{type:"edit",id:"a",title:"Review"});
  const toggled=core.changeTask(edited,{type:"toggle",id:"a"});
  assert.deepEqual(core.readTasks(JSON.stringify(toggled)),[{id:"a",title:"Review",done:true}]);
  assert.deepEqual(core.changeTask(toggled,{type:"delete",id:"a"}),[]);
  assert.deepEqual(core.readTasks("{broken"),[]);
  assert.equal(core.readTasks(JSON.stringify([...toggled,...toggled])).length,1);
});
