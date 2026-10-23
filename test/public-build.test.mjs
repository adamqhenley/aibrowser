import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

test('default prestart works in an empty directory without a DevKit or generated bundle',()=>{
  const directory=mkdtempSync(join(tmpdir(),'aibrowser-public-build-'));
  try{
    const env={...process.env};delete env.AI_BROWSER_ENABLE_CHATGPT_DEVKIT;
    const output=execFileSync(process.execPath,[fileURLToPath(new URL('../scripts/build-auth.mjs',import.meta.url))],{cwd:directory,env,encoding:'utf8'});
    assert.match(output,/optional ChatGPT DevKit disabled/);
    assert.deepEqual(readdirSync(directory),[]);
  }finally{rmSync(directory,{recursive:true,force:true});}
});
