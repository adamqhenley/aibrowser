import { app, BrowserView, BrowserWindow, ipcMain, shell } from 'electron';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {validateAIML} from './aiml.mjs';
import {chatgpt} from './chatgpt.mjs';
import {PLAN_INSTRUCTIONS,validatePlan} from './render-plan.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const appOrigin = 'aibrowser://app';
let window;
let pageView;
let provider = null;
let currentUrl = 'https://aimlwebsite.pages.dev/';
let aimlVisible=false;
let lastAIML='';
let polling=false;
let aiRequest;
function trusted(event){if(event.sender!==window.webContents||event.senderFrame!==window.webContents.mainFrame)throw Error('Only the browser interface can perform this action.');}
ipcMain.handle('chatgpt:session',async event=>{trusted(event);return chatgpt.getSession();});
ipcMain.handle('chatgpt:signin',async event=>{trusted(event);return chatgpt.signIn();});
ipcMain.handle('chatgpt:cancel-signin',event=>{trusted(event);chatgpt.cancelSignIn();});
ipcMain.handle('chatgpt:disconnect',async event=>{trusted(event);aiRequest?.abort();await chatgpt.disconnect();return chatgpt.getSession();});
ipcMain.handle('chatgpt:models',async event=>{trusted(event);return chatgpt.listModels();});
ipcMain.handle('chatgpt:usage',async event=>{trusted(event);await shell.openExternal('https://chatgpt.com/settings/usage');});
ipcMain.handle('chatgpt:cancel',event=>{trusted(event);aiRequest?.abort();});
ipcMain.handle('chatgpt:render',async(event,{prompt,model,currentPlan})=>{
  trusted(event);if(typeof prompt!=='string'||!prompt.trim()||prompt.length>4000)throw Error('Enter a request under 4000 characters.');
  if(aiRequest)throw Error('A layout request is already running.');
  const raw=lastAIML;const url=pageView.webContents.getURL();if(!raw)throw Error('This page has no valid AIML document.');
  const doc=validateAIML(JSON.parse(raw),url);if(! (await chatgpt.getSession()).sharing)throw Error('Continue with ChatGPT and enable plan usage first.');
  const models=await chatgpt.listModels();if(!models.some(m=>m.slug===model))throw Error('Choose a model available to your account.');
  const controller=new AbortController();aiRequest=controller;
  try{
    const previous=currentPlan?validatePlan(currentPlan,doc):null;
    const response=await chatgpt.streamResponse({model,instructions:PLAN_INSTRUCTIONS,input:JSON.stringify({request:prompt,currentPlan:previous,document:doc}),signal:controller.signal});
    if(raw!==lastAIML||url!==pageView.webContents.getURL())throw Error('The page changed while generating the layout. Please try again.');
    const plan=validatePlan(JSON.parse(response.text),doc);return {plan,model,revision:doc.source.revision};
  }finally{aiRequest=undefined;}
});

async function discoverAIML(){
  if(polling||!pageView||pageView.webContents.isDestroyed())return;
  polling=true;const url=pageView.webContents.getURL();
  try{
    const raw=await pageView.webContents.executeJavaScript(`(()=>{const el=document.querySelector('script[type="application/aiml+json"]');return el&&el.textContent.length<=262144?el.textContent:null;})()`);
    if(url!==pageView.webContents.getURL())return;
    if(!raw){if(lastAIML){lastAIML='';window.webContents.send('aiml:document',null);}return;}
    if(raw===lastAIML)return;
    const doc=validateAIML(JSON.parse(raw),url);lastAIML=raw;window.webContents.send('aiml:document',doc);
  }catch(error){if(lastAIML){lastAIML='';window.webContents.send('aiml:document',null);}}
  finally{polling=false;}
}

const clampUrl = (value) => {
  const candidate = String(value ?? '').trim();
  if (!candidate) return 'https://example.org';
  try { return new URL(candidate.includes('://') ? candidate : `https://${candidate}`).toString(); }
  catch { return `https://www.google.com/search?q=${encodeURIComponent(candidate)}`; }
};

const pageScript = String.raw`
(() => {
  const id = 'aibrowser-transform-style';
  const clear = () => {
    document.getElementById(id)?.remove();
    document.documentElement.removeAttribute('data-aibrowser-mode');
    document.querySelectorAll('[data-aibrowser-hidden]').forEach((node) => {
      node.hidden = false;
      node.removeAttribute('data-aibrowser-hidden');
    });
  };
  const readableNodes = () => [...document.body.querySelectorAll('main,article,[role="main"],h1,h2,h3,p,li,blockquote,pre,figcaption')]
    .filter((node) => node.offsetParent && node.innerText?.trim().length > 35)
    .slice(0, 260);
  const outline = () => readableNodes().filter((node) => /^H[1-3]$/.test(node.tagName)).map((node) => node.innerText.trim().slice(0, 180));
  const snapshot = () => ({
    title: document.title,
    url: location.href,
    headings: outline(),
    text: readableNodes().map((node) => node.innerText.trim()).join('\n').slice(0, 24000),
    hasArticle: Boolean(document.querySelector('article,main,[role="main"]'))
  });
  const style = (css) => {
    const node = document.createElement('style'); node.id = id; node.textContent = css; document.documentElement.append(node);
  };
  const hide = (selector) => document.querySelectorAll(selector).forEach((node) => { node.hidden = true; node.dataset.aibrowserHidden = 'true'; });
  window.__aibrowser = {
    snapshot,
    clear,
    apply(plan) {
      clear();
      const mode = plan?.mode || 'focus';
      document.documentElement.dataset.aibrowserMode = mode;
      const safeSelectors = Array.isArray(plan?.hideSelectors) ? plan.hideSelectors.slice(0, 16) : [];
      safeSelectors.forEach((selector) => { try { hide(selector); } catch {} });
      if (mode === 'focus' || mode === 'reader') {
        hide('iframe,aside,nav,footer,[role="banner"],[role="complementary"],[aria-label*="advert" i],[id*="advert" i],[class*="advert" i],[class*="cookie" i],[id*="cookie" i]');
        style('body{max-width:76rem!important;margin:0 auto!important;padding:3rem clamp(1.25rem,5vw,5rem)!important;background:#fbfaf7!important;color:#1f2937!important;font:20px/1.7 ui-serif,Georgia,serif!important}main,article,[role="main"]{max-width:46rem!important;margin:auto!important}p,li{max-width:46rem!important}img,video{max-width:100%!important;height:auto!important}header{position:static!important}');
      }
      if (mode === 'calm') style('*{animation:none!important;transition:none!important}body{filter:saturate(.82)!important}');
      return { mode, headings: outline() };
    }
  };
})()`;

function transformFor(prompt, snapshot) {
  const request = String(prompt ?? '').toLowerCase();
  const mode = /reader|read|article|essay|long.?form/.test(request) ? 'reader' : /calm|quiet|distraction/.test(request) ? 'calm' : 'focus';
  return {
    id: randomUUID(), mode,
    hideSelectors: ['[data-ad]', '.ad, .ads, .advertisement, .sponsored', '[data-testid*="ad"]'],
    explanation: mode === 'reader'
      ? 'Reader mode keeps the article hierarchy and removes peripheral interface elements.'
      : mode === 'calm'
        ? 'Calm mode reduces motion and visual intensity without removing source content.'
        : `Focus mode prioritizes the primary information on ${snapshot?.title || 'this page'} and suppresses common clutter.`
  };
}

async function collectSnapshot() {
  await pageView.webContents.executeJavaScript(pageScript, true);
  return pageView.webContents.executeJavaScript('window.__aibrowser.snapshot()', true);
}

async function navigate(rawUrl) {
  const url = clampUrl(rawUrl);
  currentUrl = url;
  await pageView.webContents.loadURL(url);
  return { url: pageView.webContents.getURL(), title: pageView.webContents.getTitle() };
}

function layoutPage() {
  if (!window || !pageView) return;
  const { width, height } = window.getContentBounds();
  const sidebarWidth = width <= 1050 ? 310 : 350;
  pageView.setBounds({ x: 0, y: 94, width: Math.max(0, width - sidebarWidth), height: Math.max(0, height - 94) });
}

function createWindow() {
  window = new BrowserWindow({
    width: 1400, height: 900, minWidth: 920, minHeight: 620,
    titleBarStyle: 'hiddenInset', backgroundColor: '#101622',
    webPreferences: { preload: path.join(root, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  window.loadFile(path.join(root, 'renderer', 'index.html'));
  pageView = new BrowserView({ webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true } });
  window.setBrowserView(pageView);
  layoutPage();
  window.on('resize', layoutPage);
  pageView.webContents.on('did-start-navigation',(_event,_url,isInPlace,isMainFrame)=>{if(isMainFrame&&!isInPlace){lastAIML='';aimlVisible=false;window.setBrowserView(pageView);layoutPage();window.webContents.send('aiml:document',null);}});
  pageView.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  pageView.webContents.on('did-navigate', (_event, url) => { currentUrl = url; window.webContents.send('page:location', { url, title: pageView.webContents.getTitle() }); });
  pageView.webContents.on('did-navigate-in-page', (_event, url) => { currentUrl = url; window.webContents.send('page:location', { url, title: pageView.webContents.getTitle() }); });
  pageView.webContents.on('did-finish-load', async () => {
    try { await pageView.webContents.executeJavaScript(pageScript, true); }
    catch { /* Browser-internal and restrictive pages cannot be transformed. */ }
    window.webContents.send('page:location', { url: pageView.webContents.getURL(), title: pageView.webContents.getTitle() });
  });
  navigate(currentUrl).catch(() => undefined);
  const timer=setInterval(discoverAIML,750);window.on('closed',()=>{clearInterval(timer);aiRequest?.abort();chatgpt.cancelSignIn();});
}

ipcMain.handle('aiml:show',(_event,enabled)=>{aimlVisible=Boolean(enabled)&&Boolean(lastAIML);if(aimlVisible)window.removeBrowserView(pageView);else{window.setBrowserView(pageView);layoutPage();}return aimlVisible;});

ipcMain.handle('page:navigate', (_event, url) => navigate(url));
ipcMain.handle('page:go-back', () => pageView.webContents.canGoBack() && pageView.webContents.goBack());
ipcMain.handle('page:go-forward', () => pageView.webContents.canGoForward() && pageView.webContents.goForward());
ipcMain.handle('page:reload', () => pageView.webContents.reload());
ipcMain.handle('page:snapshot', () => collectSnapshot());
ipcMain.handle('page:transform', async (_event, prompt) => {
  const snapshot = await collectSnapshot();
  const plan = transformFor(prompt, snapshot);
  const applied = await pageView.webContents.executeJavaScript(`window.__aibrowser.apply(${JSON.stringify(plan)})`, true);
  return { plan, applied, snapshot: { title: snapshot.title, url: snapshot.url, headings: snapshot.headings } };
});
ipcMain.handle('page:restore', () => pageView.webContents.executeJavaScript('window.__aibrowser.clear()', true));
ipcMain.handle('provider:configure', (_event, configuration) => {
  // Deliberately memory-only: credentials never reach page JavaScript or disk in this prototype.
  provider = { kind: configuration?.kind, baseUrl: configuration?.baseUrl, hasKey: Boolean(configuration?.apiKey) };
  return { configured: Boolean(provider.kind && provider.hasKey), provider: { kind: provider.kind, baseUrl: provider.baseUrl } };
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
