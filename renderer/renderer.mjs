const $ = (selector) => document.querySelector(selector);
const address = $('#address');
const title = $('#page-title');
const pageUrl = $('#page-url');
const result = $('#result');

function setLocation(page) {
  if (!page?.url) return;
  address.value = page.url;
  title.textContent = page.title || 'Untitled page';
  pageUrl.textContent = new URL(page.url).hostname;
}
async function transform(prompt) {
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
$('#intent-form').addEventListener('submit', (event) => { event.preventDefault(); transform($('#intent').value || 'Make this page focused and easier to use'); });
$('#restore').onclick = async () => { await window.aibrowser.restore(); result.hidden = true; };
$('#settings').onclick = () => $('#settings-dialog').showModal();
$('#save-provider').onclick = async (event) => {
  event.preventDefault();
  await window.aibrowser.configureProvider({ kind: $('#provider-kind').value, baseUrl: $('#provider-url').value, apiKey: $('#provider-key').value });
  $('#provider-key').value = '';
  $('#settings-dialog').close();
};
window.aibrowser.onLocation(setLocation);
let aimlOpen=false;
window.aibrowser.onAIML(doc=>{
  $('#aiml-toggle').hidden=!doc;
  $('#aiml-status').textContent=doc?`AIML detected · ${doc.blocks.length} blocks · Revision ${doc.source.revision}`:'No app-published AIML detected on this page.';
  if(!doc){aimlOpen=false;$('#aiml-view').hidden=true;$('#aiml-toggle').textContent='Open AIML view';window.aibrowser.showAIML(false);return;}
  $('#aiml-title').textContent=doc.source.title;
  $('#aiml-provenance').textContent=`${doc.source.publisher} · ${new URL(doc.source.canonicalUrl).hostname} · Live React state · ${doc.actionCount} declared actions (not executed)`;
  const nodes=doc.blocks.map(block=>{const section=document.createElement('section');section.className='aiml-block '+block.type;const text=document.createElement(block.type==='heading'?'h2':'p');text.textContent=block.text;const a=document.createElement('button');a.textContent='View source ↗';a.onclick=async()=>{aimlOpen=false;await window.aibrowser.showAIML(false);$('#aiml-view').hidden=true;$('#aiml-toggle').textContent='Open AIML view';await window.aibrowser.navigate(new URL(block.sourceAnchor,doc.source.canonicalUrl).href);};section.append(text,a);return section;});$('#aiml-blocks').replaceChildren(...nodes);
});
$('#aiml-toggle').onclick=async()=>{aimlOpen=await window.aibrowser.showAIML(!aimlOpen);$('#aiml-view').hidden=!aimlOpen;$('#aiml-toggle').textContent=aimlOpen?'Show original website':'Open AIML view';};
