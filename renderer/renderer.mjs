import {evaluateFeed,buildSessionGraph,facebookSearchUrl} from '../feed-policy.mjs';
const $ = (selector) => document.querySelector(selector);
const address = $('#address');
const title = $('#page-title');
const pageUrl = $('#page-url');
const result = $('#result');
let sourceDoc=null;
let layoutHistory=[];
let historyIndex=-1;
let feedActive=false,feedPaused=false;
let cloudAvailable=true;
let feedRules={topics:'',defer:'',authors:'',order:'relevance',onlyTopics:false,collapseDuplicates:true};
const keptPosts=new Set(),asidePosts=new Set();let editionLimit=null;
function filterFeed(){
  if(!sourceDoc?.adapter)return;
  const entries=sourceDoc.feedEntries||sourceDoc.blocks;
  const evaluated=evaluateFeed(entries,{...feedRules,query:$('#feed-filter').value,hideAds:$('#feed-hide-sponsored').checked,kept:keptPosts,aside:asidePosts,limit:editionLimit});
  const cards=new Map([...$('#aiml-blocks').children].map(node=>[node.dataset.blockId,node]));let shown=0;
  for(const item of evaluated){const card=cards.get(item.id);if(!card)continue;card.hidden=!item.included&&!$('#feed-show-aside').checked;card.dataset.aside=String(!item.included);const reason=card.querySelector('.feed-reason');if(reason)reason.textContent=[...item.reasons,...item.exclusions].join(' · ');$('#aiml-blocks').append(card);if(item.included)shown++;}
  $('#feed-status').textContent=`${shown} included · ${evaluated.length-shown} set aside · ${editionLimit?'frozen edition':feedPaused?'paused':'live'} · ${entries.length}/30 in session`;
  $('#layout-receipt').textContent=editionLimit?'Your edition is complete. Nothing else loads into this view until you resume.':'Local rules use text matches, not inferred interests. Set-aside posts remain inspectable.';
  const graph=buildSessionGraph(entries,feedRules.topics);const topics=graph.nodes.filter(n=>n.type==='topic');
  $('#feed-map-copy').textContent=topics.length?topics.map(topic=>`${topic.label}: ${graph.edges.filter(edge=>edge.to===topic.id).length} posts`).join(' · ')+` · ${graph.nodes.filter(n=>n.type==='source').length} displayed sources`:'No topic connections yet. Add comma-separated topics; matching is literal, not an AI judgment.';
}
function decorateFeedCards(doc){
  const entries=new Map((doc.feedEntries||[]).map(entry=>[entry.id,entry]));
  for(const card of $('#aiml-blocks').children){
    const entry=entries.get(card.dataset.blockId);if(!entry)continue;
    const body=card.querySelector('p');
    const heading=document.createElement('h2');heading.className='feed-author';heading.textContent=entry.author||'Captured post';card.prepend(heading);
    if(entry.author&&body.textContent.startsWith(entry.author+'\n'))body.textContent=body.textContent.slice(entry.author.length).trim();
    if(entry.sponsored){const label=document.createElement('span');label.className='feed-ad-label';label.textContent='Ad · page-provided label or ad-link metadata';heading.after(label);}
    if(entry.media?.length){
      const media=document.createElement('aside');media.className='feed-media';
      const title=document.createElement('strong');title.textContent=`${entry.media.length} media item${entry.media.length===1?'':'s'} · view in original`;media.append(title);
      for(const item of entry.media){
        if(typeof item.preview==='string'&&item.preview.length<=600000&&/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(item.preview)){
          const image=document.createElement('img');image.className='feed-image';image.src=item.preview;image.alt=item.description||'Image preview from the original post';media.append(image);
          const origin=document.createElement('p');origin.textContent=item.cropped?'Visible portion of original image · cropped to the source pane':'Original image preview · captured locally';media.append(origin);
        }
        if(item.description){const caption=document.createElement('p');caption.textContent=`Page-provided description: ${item.description}`;media.append(caption);}
      }
      const note=document.createElement('p');note.textContent='Images and video are not transcribed or verified.';media.append(note);body.after(media);
    }
    if(entry.truncated){const note=document.createElement('p');note.className='feed-incomplete';note.textContent='Partial post · open the original and choose “See more” to read the rest.';card.querySelector('button').before(note);}
    const controls=document.createElement('div');controls.className='feed-card-controls';
    const keep=document.createElement('button');keep.textContent=keptPosts.has(entry.id)?'Unkeep':'Keep';keep.onclick=()=>{if(keptPosts.has(entry.id))keptPosts.delete(entry.id);else{keptPosts.add(entry.id);asidePosts.delete(entry.id);}keep.textContent=keptPosts.has(entry.id)?'Unkeep':'Keep';aside.textContent=asidePosts.has(entry.id)?'Restore':'Set aside';filterFeed();};
    const aside=document.createElement('button');aside.textContent=asidePosts.has(entry.id)?'Restore':'Set aside';aside.onclick=()=>{if(asidePosts.has(entry.id))asidePosts.delete(entry.id);else{asidePosts.add(entry.id);keptPosts.delete(entry.id);}aside.textContent=asidePosts.has(entry.id)?'Restore':'Set aside';keep.textContent=keptPosts.has(entry.id)?'Unkeep':'Keep';filterFeed();};
    const why=document.createElement('details'),summary=document.createElement('summary'),reason=document.createElement('p');summary.textContent='Why here?';reason.className='feed-reason';why.append(summary,reason);controls.append(keep,aside,why);card.append(controls);
  }
}
$('#feed-filter').oninput=filterFeed;$('#feed-hide-sponsored').onchange=filterFeed;
$('#feed-show-aside').onchange=filterFeed;
$('#feed-policy-form').onsubmit=event=>{event.preventDefault();feedRules={topics:$('#feed-topics').value,defer:$('#feed-defer').value,authors:$('#feed-authors').value,order:$('#feed-order').value,onlyTopics:$('#feed-only-topics').checked,collapseDuplicates:$('#feed-deduplicate').checked};filterFeed();};
$('#feed-reset-rules').onclick=()=>{$('#feed-policy-form').reset();$('#feed-filter').value='';$('#feed-show-aside').checked=false;keptPosts.clear();asidePosts.clear();feedRules={topics:'',defer:'',authors:'',order:'relevance',onlyTopics:false,collapseDuplicates:true};document.querySelectorAll('.feed-card-controls').forEach(controls=>{controls.children[0].textContent='Keep';controls.children[1].textContent='Set aside';});filterFeed();};
$('#feed-freeze').onclick=async()=>{if(!feedActive)return;try{editionLimit=editionLimit?null:10;feedPaused=await window.aibrowser.feedPause(Boolean(editionLimit));$('#feed-pause').textContent=feedPaused?'Resume updates':'Pause updates';$('#feed-freeze').textContent=editionLimit?'Return to live capture':'Make a 10-post edition';filterFeed();}catch(error){$('#feed-status').textContent=error.message;}};
$('#feed-clear').onclick=async()=>{if(feedActive)await $('#feed-enable').onclick();$('#feed-reset-rules').click();$('#feed-status').textContent='Session cleared. No posts retained by the workspace.';};
$('#feed-search-form').onsubmit=async event=>{event.preventDefault();try{await window.aibrowser.navigate(facebookSearchUrl($('#feed-search-query').value));}catch(error){$('#feed-status').textContent=error.message;}};
$('#feed-enable').onclick=async()=>{try{feedActive=await window.aibrowser.feedEnable(!feedActive);aimlOpen=feedActive;$('#aiml-view').dataset.feed=String(feedActive);$('#aiml-view').hidden=!feedActive;$('#feed-enable').textContent=feedActive?'Disable local feed view':'Enable local feed view';$('#feed-pause').hidden=!feedActive;$('#feed-status').textContent=feedActive?'Waiting for visible feed posts. Sign in and scroll on the left.':'Local adapter is off.';if(feedActive){$('#aiml-title').textContent='Your focused feed';$('#aiml-provenance').textContent='Browser-extracted text · not a publisher-provided AIML document';$('#aiml-blocks').replaceChildren();}}catch(error){$('#feed-status').textContent=error.message;}};
$('#feed-pause').onclick=async()=>{feedPaused=await window.aibrowser.feedPause(!feedPaused);if(!feedPaused){editionLimit=null;$('#feed-freeze').textContent='Make a 10-post edition';}$('#feed-pause').textContent=feedPaused?'Resume updates':'Pause updates';filterFeed();};
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
  $('#feed-controls').hidden=!['facebook.com','www.facebook.com','m.facebook.com'].includes(new URL(page.url).hostname);
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
  const oldScroll=$('#aiml-view').scrollTop;
  const previous=sourceDoc&&currentPlan();sourceDoc=doc;
  delete $('#aiml-view').dataset.aiLayout;delete $('#aiml-view').dataset.aiTheme;delete $('#aiml-view').dataset.aiDensity;
  $('#aiml-toggle').hidden=!doc;
  $('#aiml-status').textContent=doc?`AIML detected · ${doc.blocks.length} blocks · Revision ${doc.source.revision}`:'No app-published AIML detected on this page.';
  $('#sharing-copy').textContent=!cloudAvailable?'Local views and feed rules work without a provider. Cloud AI is not included in the default build.':doc?.adapter?'Submitting sends ALL captured post text, including set-aside posts, and your request to OpenAI. Images are not sent. Pause capture first.':'Submitting sends this page’s AIML and your request to OpenAI using your ChatGPT plan.';
  if(!doc){$('#aiml-blocks').replaceChildren();$('#feed-map-copy').textContent='No session connections retained.';}
  if(!doc){feedActive=false;feedPaused=false;editionLimit=null;keptPosts.clear();asidePosts.clear();$('#feed-pause').textContent='Pause updates';$('#feed-freeze').textContent='Make a 10-post edition';$('#aiml-view').dataset.feed='false';$('#feed-enable').textContent='Enable local feed view';$('#feed-pause').hidden=true;layoutHistory=[];historyIndex=-1;updateHistoryButtons();aimlOpen=false;$('#aiml-view').hidden=true;$('#aiml-toggle').textContent='Open AIML view';window.aibrowser.showAIML(false);return;}
  $('#aiml-title').textContent=doc.source.title;
  $('#aiml-provenance').textContent=`${doc.source.publisher} · ${new URL(doc.source.canonicalUrl).hostname} · Source revision ${doc.source.revision}`;
  const nodes=doc.blocks.map((block,index)=>{const section=document.createElement('section');section.dataset.blockId=block.id;section.dataset.sourceIndex=index;section.className='aiml-block '+block.type;const text=document.createElement(block.type==='heading'?'h2':'p');text.textContent=block.text;const a=document.createElement('button');a.textContent='View source ↗';a.onclick=async()=>{aimlOpen=false;await window.aibrowser.showAIML(false);$('#aiml-view').hidden=true;$('#aiml-toggle').textContent='Open AIML view';await window.aibrowser.navigate(new URL(block.sourceAnchor,doc.source.canonicalUrl).href);};section.append(text,a);return section;});$('#aiml-blocks').replaceChildren(...nodes);
  if(doc.adapter){decorateFeedCards(doc);$('#aiml-status').textContent=`Local feed · ${doc.blocks.length} captured posts · revision ${doc.source.revision}`;}
  const compatible=previous&&previous.order.length===doc.blocks.length&&previous.order.every(id=>doc.blocks.some(b=>b.id===id));
  if(compatible){applyPlan(previous);}else{layoutHistory=[];historyIndex=-1;$('#layout-receipt').textContent='Publisher content, ready to arrange around your task.';recordLayout(currentPlan());}
  if(doc.adapter){$('#aiml-toggle').hidden=true;$('#view-mode-label').textContent='LOCAL FEED ADAPTER · VISIBLE TEXT';$('#aiml-provenance').textContent='Extracted by your browser · original posts remain on the left';$('#layout-receipt').textContent='Scroll Facebook on the left. Use local search or pause updates to read without interruptions.';$('#aiml-view').dataset.feed='true';$('#aiml-view').hidden=false;aimlOpen=true;for(const node of $('#aiml-blocks').children){const button=node.querySelector('button');button.textContent='Locate original post';button.onclick=async()=>{if(!await window.aibrowser.feedSource(node.dataset.blockId))$('#feed-status').textContent='Facebook has unloaded this post. Return to the original feed to find it.';};}$('#aiml-view').scrollTop=oldScroll;filterFeed();}
});
$('#aiml-toggle').onclick=async()=>{aimlOpen=await window.aibrowser.showAIML(!aimlOpen);$('#aiml-view').hidden=!aimlOpen;$('#aiml-toggle').textContent=aimlOpen?'Show original website':'Open AIML view';};
async function updateAccount(){
  const session=await window.aibrowser.chatGPTSession();
  if(session.available===false){
    cloudAvailable=false;
    $('#chatgpt-status').textContent=session.message;
    $('#chatgpt-signin').hidden=true;$('#chatgpt-disconnect').hidden=true;$('#chatgpt-usage').hidden=true;
    $('#chatgpt-model').disabled=true;$('#ai-submit').disabled=true;$('#intent').disabled=true;
    $('#sharing-copy').textContent='Local views and feed rules work without a provider. Cloud AI is not included in the default build.';
    return;
  }
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
