// The public/default build never reads or bundles restricted integration code.
if(process.env.AI_BROWSER_ENABLE_CHATGPT_DEVKIT==='1'){
  const {build}=await import('esbuild');
  const {existsSync}=await import('node:fs');
  const entry='local/siwc-local/src/index.ts';
  if(!existsSync(entry))throw Error('Optional DevKit not installed. See docs/optional-chatgpt.md and review its separate license first.');
  await build({entryPoints:[entry],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'build/siwc.mjs',legalComments:'linked'});
}else console.log('Local-only build: optional ChatGPT DevKit disabled.');
