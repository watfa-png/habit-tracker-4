'use strict';
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

class LocalStorageMock {
  constructor(){ this.map = new Map(); }
  getItem(k){ return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k,v){ this.map.set(k, String(v)); }
  removeItem(k){ this.map.delete(k); }
  clear(){ this.map.clear(); }
}

const context = vm.createContext({
  console,
  localStorage: new LocalStorageMock(),
  window: {},
  crypto: require('crypto').webcrypto,
  Date,
  Math,
  JSON,
  Set,
  Array,
  String,
  Number,
  Object
});
context.globalThis = context;

function load(file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, context, { filename: file });
}

load('js/utils.js');
load('js/storage.js');
vm.runInContext('Storage.initializeLocalProfile()', context);

assert.strictEqual(vm.runInContext('Storage.getSession().role', context), 'local');
assert.strictEqual(vm.runInContext('Storage.getHabits().length', context), 0);
vm.runInContext("Storage.addHabit({id:'h1',name:'Read',completedDates:[]})", context);
assert.strictEqual(vm.runInContext('Storage.getHabits().length', context), 1);
vm.runInContext("Storage.updateHabit('h1',{name:'Read 20m'})", context);
assert.strictEqual(vm.runInContext("Storage.getHabits()[0].name", context), 'Read 20m');
vm.runInContext("Storage.addEvent({id:'e1',date:'2026-08-20',title:'Plan'})", context);
assert.strictEqual(vm.runInContext("Storage.getEventsByDate('2026-08-20').length", context), 1);

assert.strictEqual(vm.runInContext("AppUtils.escapeHtml('<img onerror=1>')", context), '&lt;img onerror=1&gt;');
assert.strictEqual(vm.runInContext("AppUtils.csvCell('=SUM(A1:A2)').startsWith(\"\\\"'=\")", context), true);
assert.strictEqual(vm.runInContext("/^\\d{4}-\\d{2}-\\d{2}$/.test(AppUtils.localDateKey(new Date(2026,7,20,23,30)))", context), true);
assert.strictEqual(vm.runInContext("AppUtils.safeColor('javascript:1')", context), '#6C63FF');
assert.strictEqual(vm.runInContext("AppUtils.safeIcon('fa-book')", context), 'fa-book');

vm.runInContext(`Storage.importSnapshot({
  schemaVersion: 2,
  habits: [{id:'x',name:'<b>Read</b>',color:'javascript:1',icon:'x onerror=1',frequency:'evil',completedDates:['2026-08-20','bad']}],
  events: [{id:'e',date:'bad',title:'<img src=x onerror=1>',type:'evil'}]
})`, context);
assert.strictEqual(vm.runInContext("Storage.getHabits()[0].color", context), '#6C63FF');
assert.strictEqual(vm.runInContext("Storage.getHabits()[0].frequency", context), 'daily');
assert.strictEqual(vm.runInContext("Storage.getHabits()[0].completedDates.length", context), 1);
assert.strictEqual(vm.runInContext("Storage.getEvents()[0].type", context), 'event');

console.log('smoke tests: PASS');
