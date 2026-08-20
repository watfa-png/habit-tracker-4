'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const baseUrl = process.env.WATFA_BASE_URL || 'http://127.0.0.1:4173';
const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean);
const chromePath = chromeCandidates.find(candidate => fs.existsSync(candidate));
const screenshotDirectory = process.env.WATFA_SCREENSHOT_DIR;
const existingCdpPort = process.env.WATFA_CDP_PORT;

if (!chromePath && !existingCdpPort) {
  throw new Error('Chrome/Chromium was not found. Set CHROME_PATH to run this browser test.');
}

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function waitFor(check, message, timeout = 15000, onTimeout = null) {
    const started = Date.now();
    let lastError;
    while (Date.now() - started < timeout) {
        try {
            const value = await check();
            if (value) return value;
        } catch (error) {
            lastError = error;
        }
        await delay(50);
    }

    let diagnostics = '';
    if (onTimeout) {
        try {
            diagnostics = `\n${JSON.stringify(await onTimeout(), null, 2)}`;
        } catch (error) {
            diagnostics = `\nDiagnostics failed: ${error.message}`;
        }
    }
    if (lastError) diagnostics += `\nLast check error: ${lastError.message}`;
    throw new Error(`Timed out: ${message}${diagnostics}`);
}

async function connectCdp(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  const exceptions = [];
  const consoleMessages = [];
  const logEntries = [];
  const requests = new Map();
  const failedRequests = [];
  const documentResponses = [];

  function rejectPending(error) {
    for (const request of pending.values()) request.reject(error);
    pending.clear();
  }

  socket.addEventListener('error', () => rejectPending(new Error('Chrome DevTools connection failed')));
  socket.addEventListener('close', () => rejectPending(new Error('Chrome DevTools connection closed unexpectedly')));
  socket.addEventListener('message', event => {
    const message = JSON.parse(String(event.data));
    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      exceptions.push(details.exception?.description || details.text);
    }
    if (message.method === 'Runtime.consoleAPICalled') {
      consoleMessages.push({
        type: message.params.type,
        text: message.params.args.map(argument => argument.value ?? argument.description ?? '').join(' ')
      });
    }
    if (message.method === 'Log.entryAdded') {
      logEntries.push(message.params.entry);
    }
    if (message.method === 'Network.requestWillBeSent') {
      requests.set(message.params.requestId, {
        url: message.params.request.url,
        type: message.params.type
      });
    }
    if (message.method === 'Network.loadingFailed') {
      failedRequests.push({
        ...requests.get(message.params.requestId),
        errorText: message.params.errorText,
        canceled: message.params.canceled || false
      });
    }
    if (message.method === 'Network.responseReceived' && message.params.type === 'Document') {
      documentResponses.push({
        url: message.params.response.url,
        status: message.params.response.status,
        statusText: message.params.response.statusText
      });
    }
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  function send(method, params = {}) {
    const id = ++nextId;
    if (socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('Chrome DevTools connection is not open'));
    }
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  async function evaluate(expression) {
    const response = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
    return response.result.value;
  }

  return {
    socket,
    send,
    evaluate,
    exceptions,
    consoleMessages,
    logEntries,
    failedRequests,
    documentResponses
  };
}

(async () => {
  const profileDirectory = existingCdpPort ? null : fs.mkdtempSync(path.join(process.cwd(), '.chrome-test-'));
  if (screenshotDirectory) fs.mkdirSync(screenshotDirectory, { recursive: true });
  const chromeOutput = [];
  let chrome = null;
  if (!existingCdpPort) {
    chrome = spawn(chromePath, [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${profileDirectory}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-component-update',
      'about:blank'
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    for (const stream of [chrome.stdout, chrome.stderr]) {
      stream.on('data', chunk => {
        chromeOutput.push(String(chunk).trim());
        if (chromeOutput.length > 20) chromeOutput.shift();
      });
    }
  }

  let cdp;
  try {
    let port = existingCdpPort;
    if (!port) {
      const activePortFile = path.join(profileDirectory, 'DevToolsActivePort');
      await waitFor(
        () => fs.existsSync(activePortFile),
        'Chrome DevTools port',
        15000,
        () => ({ chromeExitCode: chrome.exitCode, chromeOutput })
      );
      [port] = fs.readFileSync(activePortFile, 'utf8').trim().split(/\r?\n/);
    }
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    cdp = await connectCdp(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');
    await cdp.send('Log.enable');

    async function initializationState() {
      return cdp.evaluate(`(() => ({
        url: location.href,
        readyState: document.readyState,
        i18nPending: document.documentElement.classList.contains('i18n-pending'),
        translationsAvailable: typeof Translations !== 'undefined',
        storageAvailable: typeof Storage !== 'undefined',
        uiAvailable: typeof UI !== 'undefined',
        uiInitialized: typeof UI !== 'undefined' && UI.initialized === true,
        appAvailable: typeof App !== 'undefined',
        appInitialized: typeof App !== 'undefined' && App.initialized === true,
        appState: document.documentElement.dataset.appState || null,
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        languageSelectorCount: document.querySelectorAll('[data-language-selector]').length,
        errorBanner: document.querySelector('.app-error-banner')?.textContent || null
      }))()`);
    }

    async function diagnostics() {
      let state;
      try {
        state = await initializationState();
      } catch (error) {
        state = { evaluationError: error.message };
      }
      return {
        state,
        exceptions: cdp.exceptions,
        consoleMessages: cdp.consoleMessages.slice(-10),
        logEntries: cdp.logEntries.slice(-10),
        failedRequests: cdp.failedRequests.slice(-10),
        documentResponses: cdp.documentResponses.slice(-5)
      };
    }

    async function navigate(pagePath) {
      const targetUrl = new URL(pagePath, `${baseUrl.replace(/\/+$/, '')}/`).href;
      const failedRequestStart = cdp.failedRequests.length;
      const documentResponseStart = cdp.documentResponses.length;
      const navigation = await cdp.send('Page.navigate', { url: targetUrl });
      assert.ok(!navigation.errorText, `Navigation failed for ${targetUrl}: ${navigation.errorText}`);
      await waitFor(
        async () => cdp.evaluate(`document.documentElement.dataset.appState === 'ready' &&
          typeof Translations !== 'undefined' && typeof UI !== 'undefined' && UI.initialized === true &&
          typeof App !== 'undefined' && App.initialized === true &&
          !document.documentElement.classList.contains('i18n-pending') && location.href === ${JSON.stringify(targetUrl)}`),
        `${pagePath} initialization`,
        15000,
        diagnostics
      );

      const state = await initializationState();
      assert.strictEqual(state.url, targetUrl);
      assert.notStrictEqual(state.readyState, 'loading');
      assert.strictEqual(state.i18nPending, false);
      assert.strictEqual(state.translationsAvailable, true);
      assert.strictEqual(state.uiInitialized, true);
      assert.strictEqual(state.appInitialized, true);
      assert.strictEqual(state.appState, 'ready');
      assert.strictEqual(state.errorBanner, null);

      const documentResponse = cdp.documentResponses
        .slice(documentResponseStart)
        .find(response => response.url === targetUrl);
      assert.ok(documentResponse, `No document response was captured for ${targetUrl}`);
      assert.ok(documentResponse.status >= 200 && documentResponse.status < 400,
        `Unexpected HTTP ${documentResponse.status} for ${targetUrl}`);

      const localFailures = cdp.failedRequests.slice(failedRequestStart).filter(request =>
        request.url && new URL(request.url).origin === new URL(baseUrl).origin && !request.canceled
      );
      assert.deepStrictEqual(localFailures, []);
      return state;
    }

    async function assertLanguageSelectors(expectedCount = 1) {
      const selectors = await cdp.evaluate(`Array.from(document.querySelectorAll('[data-language-selector]'), selector => ({
        value: selector.value,
        options: Array.from(selector.options, option => [option.value, option.textContent.trim()])
      }))`);
      assert.strictEqual(selectors.length, expectedCount);
      selectors.forEach(selector => assert.deepStrictEqual(selector.options, [
        ['ar', 'العربية'], ['tr', 'Türkçe'], ['en', 'English']
      ]));
      return selectors;
    }

    async function selectLanguage(selector, language) {
      await cdp.evaluate(`(() => {
        const selector = document.querySelector(${JSON.stringify(selector)});
        selector.value = ${JSON.stringify(language)};
        selector.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      })()`);
      await waitFor(
        () => cdp.evaluate(`document.documentElement.lang === ${JSON.stringify(language)} &&
          document.documentElement.dir === ${JSON.stringify(language === 'ar' ? 'rtl' : 'ltr')} &&
          Array.from(document.querySelectorAll('[data-language-selector]')).every(item => item.value === ${JSON.stringify(language)}) &&
          localStorage.getItem('watfa_habit_tracker_language_v2') === ${JSON.stringify(JSON.stringify(language))}`),
        `${language} runtime switch`,
        15000,
        diagnostics
      );
    }

    await navigate('dashboard.html');
    await cdp.evaluate('localStorage.clear(); true');
    await navigate('dashboard.html?clean=1');

    await assertLanguageSelectors();
    assert.strictEqual(await cdp.evaluate('document.documentElement.lang'), 'ar');
    assert.strictEqual(await cdp.evaluate('document.documentElement.dir'), 'rtl');

    await cdp.evaluate("window.__localeSentinel = 'no-reload'");
    await selectLanguage('[data-language-selector]', 'tr');
    assert.strictEqual(await cdp.evaluate('window.__localeSentinel'), 'no-reload');
    assert.strictEqual(await cdp.evaluate('document.documentElement.dir'), 'ltr');
    assert.strictEqual(await cdp.evaluate("localStorage.getItem('watfa_habit_tracker_language_v2')"), '"tr"');
    assert.strictEqual(await cdp.evaluate("document.querySelector('.welcome-section h1').textContent.trim()"), 'Kontrol Paneli');
    assert.strictEqual(await cdp.evaluate("document.querySelector('#habitsList .empty-state h3').textContent.trim()"), 'Henüz alışkanlık yok');
    assert.strictEqual(await cdp.evaluate('document.title'), 'Kontrol Paneli - Watfa Habit Tracker');

    await cdp.evaluate(`(() => {
      document.querySelector('#addHabitBtn').click();
      document.querySelector('#habitName').value = 'Test alışkanlığı';
      document.querySelector('#addHabitForm').requestSubmit();
      return true;
    })()`);
    assert.strictEqual(await cdp.evaluate("document.querySelector('.habit-name').textContent"), 'Test alışkanlığı');
    assert.match(await cdp.evaluate("document.querySelector('.habit-action-btn:not(.delete)').getAttribute('aria-label')"), /düzenle/);
    assert.strictEqual(await cdp.evaluate("document.querySelector('#toastMessage').textContent"), 'Alışkanlık eklendi');

    if (screenshotDirectory) {
      const dashboardShot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      fs.writeFileSync(path.join(screenshotDirectory, 'watfa-turkish-dashboard.png'), Buffer.from(dashboardShot.data, 'base64'));
    }

    await navigate('dashboard.html?reload=turkish');
    await assertLanguageSelectors();
    assert.strictEqual(await cdp.evaluate('document.documentElement.lang'), 'tr');
    assert.strictEqual(await cdp.evaluate('document.documentElement.dir'), 'ltr');
    assert.strictEqual(await cdp.evaluate("document.querySelector('[data-language-selector]').value"), 'tr');
    assert.strictEqual(await cdp.evaluate("document.querySelector('.welcome-section h1').textContent.trim()"), 'Kontrol Paneli');
    assert.strictEqual(await cdp.evaluate("localStorage.getItem('watfa_habit_tracker_language_v2')"), '"tr"');

    await navigate('calendar.html');
    await assertLanguageSelectors();
    assert.strictEqual(await cdp.evaluate('document.documentElement.lang'), 'tr');
    assert.strictEqual(await cdp.evaluate('document.documentElement.dir'), 'ltr');
    assert.strictEqual(await cdp.evaluate("document.querySelector('.welcome-section h1').textContent.trim()"), 'Takvim');
    await cdp.evaluate(`(() => {
      document.querySelector('#calendarGrid .calendar-day.today').click();
      document.querySelector('#addEventBtn').click();
      document.querySelector('#eventTitle').value = 'Deneme etkinliği';
      document.querySelector('#eventForm').requestSubmit();
      return true;
    })()`);
    assert.strictEqual(await cdp.evaluate("document.querySelector('#toastMessage').textContent"), 'Etkinlik başarıyla eklendi');
    assert.strictEqual(await cdp.evaluate("document.querySelector('.event-title').textContent"), 'Deneme etkinliği');

    await navigate('statistics.html');
    await assertLanguageSelectors();
    assert.strictEqual(await cdp.evaluate('document.documentElement.lang'), 'tr');
    assert.strictEqual(await cdp.evaluate('document.documentElement.dir'), 'ltr');
    assert.strictEqual(await cdp.evaluate("document.querySelector('.welcome-section h1').textContent.trim()"), 'İstatistikler');

    await navigate('settings.html');
    await assertLanguageSelectors(2);
    assert.strictEqual(await cdp.evaluate('document.documentElement.lang'), 'tr');
    assert.strictEqual(await cdp.evaluate('document.documentElement.dir'), 'ltr');
    assert.strictEqual(await cdp.evaluate("Array.from(document.querySelectorAll('[data-language-selector]')).every(selector => selector.value === 'tr')"), true);
    assert.strictEqual(await cdp.evaluate("document.querySelector('#currentUsername').textContent"), 'Watfa Kullanıcısı');
    assert.strictEqual(await cdp.evaluate("document.querySelector('[data-translate=delete_account]').textContent"), 'Yerel Verileri Sil');

    await selectLanguage('#languageSetting', 'en');
    assert.strictEqual(await cdp.evaluate('document.documentElement.dir'), 'ltr');
    assert.strictEqual(await cdp.evaluate("document.querySelector('.welcome-section h1').textContent.trim()"), 'Settings');

    await selectLanguage('#languageSetting', 'ar');
    assert.strictEqual(await cdp.evaluate('document.documentElement.dir'), 'rtl');
    assert.strictEqual(await cdp.evaluate("document.querySelector('.welcome-section h1').textContent.trim()"), 'الإعدادات');

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true
    });
    await selectLanguage('[data-language-selector]', 'tr');
    assert.strictEqual(await cdp.evaluate('document.documentElement.dir'), 'ltr');
    assert.notStrictEqual(await cdp.evaluate("getComputedStyle(document.querySelector('[data-language-selector]')).display"), 'none');

    if (screenshotDirectory) {
      const mobileShot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      fs.writeFileSync(path.join(screenshotDirectory, 'watfa-turkish-mobile.png'), Buffer.from(mobileShot.data, 'base64'));
    }

    assert.deepStrictEqual(cdp.exceptions, []);
    assert.deepStrictEqual(cdp.consoleMessages.filter(message => message.type === 'error'), []);
    console.log('browser localization tests: PASS');
  } finally {
    try { cdp?.socket.close(); } catch {}
    if (chrome) {
      chrome.kill();
      await delay(300);
    }
    if (profileDirectory) {
      try { fs.rmSync(profileDirectory, { recursive: true, force: true }); } catch {}
    }
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
