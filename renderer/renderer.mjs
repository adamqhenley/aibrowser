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
