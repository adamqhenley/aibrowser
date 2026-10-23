import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadChatGPT} from '../provider-loader.mjs';

test('default provider never imports restricted code or reads credentials',async()=>{
  const client=await loadChatGPT({load:()=>{throw Error('Must not load');}});
  assert.equal((await client.getSession()).available,false);
  assert.equal((await client.getSession()).sharing,false);
  assert.deepEqual(await client.listModels(),[]);
  await assert.rejects(client.signIn(),/not included/);
  await assert.rejects(client.streamResponse(),/not included/);
  client.cancelSignIn();await client.disconnect();
});
test('an explicitly enabled provider uses only the supplied loader and config',async()=>{
  const config={test:true},client={local:true};
  assert.equal(await loadChatGPT({enabled:true,config,load:async()=>({createChatGPT:value=>{assert.equal(value,config);return client;}})}),client);
  await assert.rejects(loadChatGPT({enabled:true}),/explicit local provider loader/);
});
