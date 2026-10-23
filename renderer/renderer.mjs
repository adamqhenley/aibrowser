const $ = (selector) => document.querySelector(selector);
const address = $('#address');
const title = $('#page-title');
const pageUrl = $('#page-url');
const result = $('#result');
let sourceDoc=null;
let layoutHistory=[];
let historyIndex=-1;
function currentPlan(){const view=$('#aiml-view');if(!sourceDoc)return null;const preset=view.dataset.mode;return {layout:view.dataset.aiLayout||(preset==='focus'?'cards':preset?'reader':'list'),theme:view.dataset.aiTheme||(preset==='calm'?'warm':'light'),density:view.dataset.aiDensity||(preset==='focus'?'compact':'spacious'),order:[...$('#aiml-blocks').children].map(n=>n.dataset.blockId),explanation:$('#result-copy').textContent||'Original publisher order.'};}
function recordLayout(plan){layoutHistory=layoutHistory.slice(0,historyIndex+1);layoutHistory.push(structuredClone(plan));if(layoutHistory.length>20)layoutHistory.shift();historyIndex=layoutHistory.length-1;updateHistoryButtons();}
function updateHistoryButtons(){$('#undo-layout').disabled=historyIndex<=0;$('#redo-layout').disabled=historyIndex>=layoutHistory.length-1;}
function applyPlan(plan){const view=$('#aiml-view');delete view.dataset.mode;view.dataset.aiLayout=plan.layout;view.dataset.aiTheme=plan.theme;view.dataset.aiDensity=plan.density;const blocks=$('#aiml-blocks');const nodes=new Map([...blocks.children].map(n=>[n.dataset.blockId,n]));plan.order.forEach(id=>{if(nodes.has(id))blocks.append(nodes.get(id));});$('#result-copy').textContent=plan.explanation;$('#layout-receipt').textContent=plan.explanation;$('#view-mode-label').textContent='YOUR VIEW · SOURCE TEXT PRESERVED';result.hidden=false;view.scrollTop=0;document.querySelectorAll('[data-prompt]').forEach(b=>b.setAttribute('aria-pressed','false'));}
$('#undo-layout').onclick=()=>{if(historyIndex>0){applyPlan(layoutHistory[--historyIndex]);updateHistoryButtons();}};
$('#redo-layout').onclick=()=>{if(historyIndex<layoutHistory.length-1){applyPlan(layoutHistory[++historyIndex]);updateHistoryButtons();}};
$('#toggle-sources').onclick=()=>{const show=$('#aiml-view').dataset.showSources!=='true';$('#aiml-view').dataset.showSources=String(show);$('#toggle-sources').textContent=show?'Hide sources':'Show sources';$('#toggle-sources').setAttribute('aria-pressed',String(show));};

function setLocation(page) {
  if (!page?.url) return;
  address.value = page.url;
  title.textContent = page.title || 'Untitled page';
  pageUrl.textContent = new URL(page.url).hostname;
}
async function transform(prompt) {
  if(aimlOpen){
    delete $('#aiml-view').dataset.aiLayout;delete $('#aiml-view').dataset.aiTheme;delete $('#aiml-view').dataset.aiDensity;
    const mode=/focus/i.test(prompt)?'focus':/reader|read|article|essay|long.?form/i.test(prompt)?'reader':/calm|quiet|distraction/i.test(prompt)?'calm':'focus';
    $('#aiml-view').dataset.mode=mode;
    $('#aiml-view').scrollTop=0;
    document.querySelectorAll('[data-prompt]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
    $('#view-mode-label').textContent=`AIML · ${mode.toUpperCase()} VIEW`;
    $('#result-copy').textContent={focus:'Focus: compact record cards and a prominent count. All publisher content and source links are preserved.',reader:'Reader: a narrow reading column with larger serif text and generous spacing.',calm:'Calm: a warm, low-stimulation reading surface with spacious sections and no motion.'}[mode];
    $('#layout-receipt').textContent=$('#result-copy').textContent;
    recordLayout({...currentPlan(),layout:mode==='focus'?'cards':'reader',theme:mode==='calm'?'warm':'light',density:mode==='focus'?'compact':'spacious'});
    result.hidden=false;$('#intent').value='';return;
  }
  const response = await window.aibrowser.transform(prompt);
  result.hidden = false;
  $('#result-copy').textContent = response.plan.explanation;
  $('#intent').value = '';
  setLocation(response.snapshot);
}

$('#address-form').addEventListener('submit', async (event) => { event.preventDefault(); await window.aibrowser.navigate(address.value); });
$('#back').onclick = () => window.aibrowser.back();
$('#forward').onclick = () => window.aibrowser.forward();
$('#reload').onclick = () => window.aibrowser.reload();
document.querySelectorAll('[data-prompt]').forEach((button) => button.onclick = () => transform(button.dataset.prompt));
$('#intent-form').addEventListener('submit', async event => {
  event.preventDefault();$('#ai-submit').disabled=true;$('#ai-cancel').hidden=false;$('#ai-status').textContent='Generating a layout with ChatGPT…';
  try{
    const {plan,model,revision}=await window.aibrowser.aiRender({prompt:$('#intent').value,model:$('#chatgpt-model').value,currentPlan:currentPlan()});
    aimlOpen=await window.aibrowser.showAIML(true);$('#aiml-view').hidden=!aimlOpen;$('#aiml-toggle').textContent='Show original website';
    applyPlan(plan);recordLayout(plan);
    $('#view-mode-label').textContent='CHATGPT LAYOUT · SOURCE TEXT PRESERVED';$('#result-copy').textContent=plan.explanation;result.hidden=false;
    $('#ai-status').textContent=`Using ChatGPT plan · ${model} · source revision ${revision}`;$('#intent').value='';$('#intent').placeholder='Refine this view: “Keep the order, make it warmer…”';
  }catch(error){$('#ai-status').textContent=error.message;}
  finally{$('#ai-submit').disabled=false;$('#ai-cancel').hidden=true;}
});
$('#restore').onclick = async () => { if(aimlOpen&&sourceDoc){const plan={layout:'list',theme:'light',density:'spacious',order:sourceDoc.blocks.map(b=>b.id),explanation:'Restored the publisher’s original content order.'};applyPlan(plan);recordLayout(plan);}else await window.aibrowser.restore();document.querySelectorAll('[data-prompt]').forEach(button=>button.setAttribute('aria-pressed','false'));result.hidden = true; };
$('#settings').onclick = () => {$('#chatgpt-account').open=true;$('#chatgpt-account').scrollIntoView({block:'start',behavior:'smooth'});};
$('#save-provider').onclick = async (event) => {
  event.preventDefault();
  await window.aibrowser.configureProvider({ kind: $('#provider-kind').value, baseUrl: $('#provider-url').value, apiKey: $('#provider-key').value });
  $('#provider-key').value = '';
  $('#settings-dialog').close();
};
window.aibrowser.onLocation(setLocation);
let aimlOpen=false;
window.aibrowser.onAIML(doc=>{
  const previous=sourceDoc&&currentPlan();sourceDoc=doc;
  delete $('#aiml-view').dataset.aiLayout;delete $('#aiml-view').dataset.aiTheme;delete $('#aiml-view').dataset.aiDensity;
  $('#aiml-toggle').hidden=!doc;
  $('#aiml-status').textContent=doc?`AIML detected · ${doc.blocks.length} blocks · Revision ${doc.source.revision}`:'No app-published AIML detected on this page.';
  if(!doc){layoutHistory=[];historyIndex=-1;updateHistoryButtons();aimlOpen=false;$('#aiml-view').hidden=true;$('#aiml-toggle').textContent='Open AIML view';window.aibrowser.showAIML(false);return;}
  $('#aiml-title').textContent=doc.source.title;
  $('#aiml-provenance').textContent=`${doc.source.publisher} · ${new URL(doc.source.canonicalUrl).hostname} · Source revision ${doc.source.revision}`;
  const nodes=doc.blocks.map((block,index)=>{const section=document.createElement('section');section.dataset.blockId=block.id;section.dataset.sourceIndex=index;section.className='aiml-block '+block.type;const text=document.createElement(block.type==='heading'?'h2':'p');text.textContent=block.text;const a=document.createElement('button');a.textContent='View source ↗';a.onclick=async()=>{aimlOpen=false;await window.aibrowser.showAIML(false);$('#aiml-view').hidden=true;$('#aiml-toggle').textContent='Open AIML view';await window.aibrowser.navigate(new URL(block.sourceAnchor,doc.source.canonicalUrl).href);};section.append(text,a);return section;});$('#aiml-blocks').replaceChildren(...nodes);
  const compatible=previous&&previous.order.length===doc.blocks.length&&previous.order.every(id=>doc.blocks.some(b=>b.id===id));
  if(compatible){applyPlan(previous);}else{layoutHistory=[];historyIndex=-1;$('#layout-receipt').textContent='Publisher content, ready to arrange around your task.';recordLayout(currentPlan());}
});
$('#aiml-toggle').onclick=async()=>{aimlOpen=await window.aibrowser.showAIML(!aimlOpen);$('#aiml-view').hidden=!aimlOpen;$('#aiml-toggle').textContent=aimlOpen?'Show original website':'Open AIML view';};
async function updateAccount(){
  const session=await window.aibrowser.chatGPTSession();
  $('#chatgpt-status').textContent=session.status==='connected'?`${session.identity?.email||'Connected'} · ${session.sharing?'Using ChatGPT plan':'Plan usage not enabled'}`:'Not connected';
  $('#chatgpt-signin').hidden=session.sharing;$('#chatgpt-disconnect').hidden=session.status!=='connected';
  if(!session.sharing)$('#chatgpt-account').open=true;
  const picker=$('#chatgpt-model');picker.replaceChildren();picker.disabled=true;
  if(session.sharing){try{const models=await window.aibrowser.chatGPTModels();for(const model of models){const option=document.createElement('option');option.value=model.slug;option.textContent=model.displayName;picker.append(option);}picker.disabled=!models.length;if(!models.length)$('#chatgpt-status').textContent+=' · No models available';}catch(error){$('#chatgpt-status').textContent=error.message;}}
}
$('#chatgpt-signin').onclick=async()=>{$('#chatgpt-signin').disabled=true;$('#chatgpt-cancel-signin').hidden=false;$('#chatgpt-status').textContent='Complete sign-in and plan consent in your browser…';try{await window.aibrowser.chatGPTSignIn();await updateAccount();}catch(error){$('#chatgpt-status').textContent=error.message;}finally{$('#chatgpt-signin').disabled=false;$('#chatgpt-cancel-signin').hidden=true;}};
$('#chatgpt-cancel-signin').onclick=()=>window.aibrowser.chatGPTCancelSignIn();
$('#chatgpt-disconnect').onclick=async()=>{try{await window.aibrowser.chatGPTDisconnect();await updateAccount();}catch(error){$('#chatgpt-status').textContent=error.message;}};
$('#chatgpt-usage').onclick=()=>window.aibrowser.chatGPTUsage();$('#ai-cancel').onclick=()=>window.aibrowser.aiCancel();
updateAccount().catch(error=>{$('#chatgpt-status').textContent=error.message;});
