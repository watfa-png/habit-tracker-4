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
assert.deepStrictEqual(
  Array.from(vm.runInContext('Translations.supportedLanguages', context)),
  ['ar', 'tr', 'en']
);
assert.strictEqual(vm.runInContext("Translations.get('dashboard', 'ar')", context), 'لوحة التحكم');
assert.strictEqual(vm.runInContext("Translations.get('dashboard', 'tr')", context), 'Kontrol Paneli');
assert.strictEqual(vm.runInContext("Translations.get('dashboard', 'en')", context), 'Dashboard');
vm.runInContext("Storage.setLanguage('tr')", context);
assert.strictEqual(vm.runInContext('Storage.getLanguage()', context), 'tr');
assert.strictEqual(context.localStorage.getItem('watfa_habit_tracker_language_v2'), '"tr"');
assert.strictEqual(vm.runInContext("Translations.locale('tr')", context), 'tr-TR');
const translationParity = vm.runInContext(`(() => {
  const sets = ['ar','tr','en'].map(lang => Object.keys(Translations.translations[lang]).sort().join('|'));
  return sets.every(x => x === sets[0]);
})()`, context);
assert.strictEqual(translationParity, true);
const catalogsAreComplete = vm.runInContext(`(() => ['ar', 'tr', 'en'].every(lang =>
  Object.values(Translations.translations[lang]).every(value =>
    Array.isArray(value)
      ? value.length > 0 && value.every(item => typeof item === 'string' && item.trim().length > 0)
      : typeof value === 'string' && value.trim().length > 0
  )
))()`, context);
assert.strictEqual(catalogsAreComplete, true);

const requiredLocalizationKeys = [
  'select_language', 'open_navigation_menu', 'previous_month', 'next_month',
  'close_dialog', 'edit_habit_aria', 'delete_habit_aria', 'edit_event_aria',
  'delete_event_aria', 'heatmap_tooltip', 'calendar_day_summary', 'default_username'
];
for (const key of requiredLocalizationKeys) {
  for (const lang of ['ar', 'tr', 'en']) {
    assert.strictEqual(
      vm.runInContext(`typeof Translations.translations.${lang}[${JSON.stringify(key)}] === 'string' && Translations.translations.${lang}[${JSON.stringify(key)}].trim().length > 0`, context),
      true,
      `missing required ${key} in ${lang}`
    );
  }
}

const translatedNode = {
  textContent: '',
  getAttribute(name) { return name === 'data-translate' ? 'dashboard' : null; },
  setAttribute() {}
};
const languageSelector = { value: '', setAttribute() {} };
const documentAttributes = {};
context.document = {
  title: '',
  lastEvent: null,
  documentElement: {
    setAttribute(name, value) { documentAttributes[name] = value; },
    classList: { remove() {} }
  },
  body: { setAttribute() {} },
  querySelectorAll(selector) {
    if (selector === '[data-translate]') return [translatedNode];
    if (selector === '[data-language-selector], #languageSetting') return [languageSelector];
    return [];
  },
  dispatchEvent(event) { this.lastEvent = event; }
};
context.CustomEvent = class CustomEvent { constructor(type, init) { this.type = type; this.detail = init.detail; } };
context.window.location = { pathname: '/settings.html' };

vm.runInContext("Translations.setLanguage('ar')", context);
assert.strictEqual(documentAttributes.lang, 'ar');
assert.strictEqual(documentAttributes.dir, 'rtl');
vm.runInContext("Translations.setLanguage('tr')", context);
assert.strictEqual(documentAttributes.lang, 'tr');
assert.strictEqual(documentAttributes.dir, 'ltr');
assert.strictEqual(translatedNode.textContent, 'Kontrol Paneli');
assert.strictEqual(languageSelector.value, 'tr');
assert.strictEqual(context.document.lastEvent.detail.language, 'tr');
vm.runInContext("Translations.setLanguage('en')", context);
assert.strictEqual(documentAttributes.lang, 'en');
assert.strictEqual(documentAttributes.dir, 'ltr');

for (const htmlFile of ['index.html','dashboard.html','calendar.html','statistics.html','settings.html']) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  const referenced = [
    ...html.matchAll(/data-translate=\"([^\"]+)\"/g),
    ...html.matchAll(/data-translate-placeholder=\"([^\"]+)\"/g),
    ...html.matchAll(/data-translate-aria-label=\"([^\"]+)\"/g),
    ...html.matchAll(/data-translate-title=\"([^\"]+)\"/g)
  ].map(match => match[1]);
  for (const key of referenced) {
    for (const lang of ['ar','tr','en']) {
      assert.ok(vm.runInContext(`Object.prototype.hasOwnProperty.call(Translations.translations['${lang}'], '${key}')`, context), `${htmlFile}: missing ${key} in ${lang}`);
    }
  }

  assert.ok(html.includes('js/language-bootstrap.js'), `${htmlFile}: missing pre-paint language bootstrap`);
  const selectors = [...html.matchAll(/<select\b[^>]*data-language-selector[^>]*>([\s\S]*?)<\/select>/g)];
  assert.ok(selectors.length > 0, `${htmlFile}: missing language selector`);
  for (const selector of selectors) {
    const options = [...selector[1].matchAll(/<option\s+value=\"([^\"]+)\">([^<]+)<\/option>/g)]
      .map(match => [match[1], match[2]]);
    assert.deepStrictEqual(options, [['ar', 'العربية'], ['tr', 'Türkçe'], ['en', 'English']]);
  }
}

for (const jsFile of fs.readdirSync('js').filter(file => file.endsWith('.js'))) {
  const source = fs.readFileSync(`js/${jsFile}`, 'utf8');
  const referenced = [...source.matchAll(/Translations\.(?:get|format)\(\s*['\"]([^'\"]+)['\"]/g)]
    .map(match => match[1]);
  for (const key of referenced) {
    for (const lang of ['ar', 'tr', 'en']) {
      assert.ok(
        vm.runInContext(`Object.prototype.hasOwnProperty.call(Translations.translations['${lang}'], '${key}')`, context),
        `${jsFile}: missing ${key} in ${lang}`
      );
    }
  }
}

const uiSource = fs.readFileSync('js/ui.js', 'utf8');
assert.ok(uiSource.includes("document.addEventListener('watfa:languagechange'"));
assert.ok(!/setLanguage\([^)]*\);\s*window\.location\.reload\(\)/.test(uiSource), 'language changes must not force a reload');

const bootstrapStorage = new LocalStorageMock();
bootstrapStorage.setItem('watfa_habit_tracker_language_v2', '"tr"');
const bootstrapRoot = { lang: '', dir: '', classList: { add() {}, remove() {} } };
vm.runInNewContext(fs.readFileSync('js/language-bootstrap.js', 'utf8'), {
  localStorage: bootstrapStorage,
  document: { documentElement: bootstrapRoot },
  window: { setTimeout() {} },
  console,
  JSON
});
assert.strictEqual(bootstrapRoot.lang, 'tr');
assert.strictEqual(bootstrapRoot.dir, 'ltr');


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
