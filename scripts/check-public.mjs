import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const files=[...new Set(execFileSync('git',['ls-files','-c','-o','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean))].filter(file=>existsSync(resolve(root,file)));
const errors=[];
for(const file of files){
  if(/^(vendor|local|build|node_modules|dist|out)\//.test(file)||/(^|\/)\.env(?:\.|$)/.test(file)||/\.(?:pem|p12|key)$/i.test(file))errors.push(`Private, generated, or restricted path: ${file}`);
  if(!/\.(?:mjs|cjs|js|ts|md|html|json|ya?ml|css|txt)$/.test(file))continue;
  const text=readFileSync(resolve(root,file),'utf8');
  if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)||/\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/.test(text)||/\bgh[pousr]_[A-Za-z0-9]{30,}/.test(text))errors.push(`Possible credential in ${file}`);
}
for(const file of ['LICENSE','NOTICE','CONTRIBUTING.md','SECURITY.md','PRIVACY.md'])if(!existsSync(resolve(root,file)))errors.push(`Missing ${file}`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Public source guardrails passed (${files.length} files). This is not a complete license or secret audit; ignored local files and Git history are not scanned.`);
