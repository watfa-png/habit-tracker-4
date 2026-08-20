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
load('js/translations.js');
assert.strictEqual(vm.runInContext("Translations.get('dashboard', 'ar')", context), 'لوحة التحكم');
assert.strictEqual(vm.runInContext("Translations.get('dashboard', 'tr')", context), 'Kontrol Paneli');
assert.strictEqual(vm.runInContext("Translations.get('dashboard', 'en')", context), 'Dashboard');
vm.runInContext("Storage.setLanguage('tr')", context);
assert.strictEqual(vm.runInContext('Storage.getLanguage()', context), 'tr');
assert.strictEqual(vm.runInContext("Translations.locale('tr')", context), 'tr-TR');
const translationParity = vm.runInContext(`(() => {
  const sets = ['ar','tr','en'].map(lang => Object.keys(Translations.translations[lang]).sort().join('|'));
  return sets.every(x => x === sets[0]);
})()`, context);
assert.strictEqual(translationParity, true);

for (const htmlFile of ['index.html','dashboard.html','calendar.html','statistics.html','settings.html']) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  const referenced = [
    ...html.matchAll(/data-translate=\"([^\"]+)\"/g),
    ...html.matchAll(/data-translate-placeholder=\"([^\"]+)\"/g)
  ].map(match => match[1]);
  for (const key of referenced) {
    for (const lang of ['ar','tr','en']) {
      assert.ok(vm.runInContext(`Object.prototype.hasOwnProperty.call(Translations.translations['${lang}'], '${key}')`, context), `${htmlFile}: missing ${key} in ${lang}`);
    }
  }
}


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
