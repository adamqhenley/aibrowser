import {test} from 'node:test';
import assert from 'node:assert/strict';
import {allowedImageUrl,fullImagePreview,safePreview} from '../feed-media.mjs';
import {mergePosts} from '../facebook-adapter.mjs';
test('only HTTPS images from the known Facebook CDN are eligible',()=>{
  assert.ok(allowedImageUrl('https://scontent.example.fbcdn.net/image.jpg'));
  for(const url of ['https://fbcdn.net.evil.test/a','http://fbcdn.net/a','https://127.0.0.1/a','file:///etc/passwd','https://user:secret@fbcdn.net/a','https://fbcdn.net:123/a'])assert.equal(allowedImageUrl(url),null);
});
test('full images use cache-aware fetch without credentials, redirects, or cropping',async()=>{
  let options;const image={isEmpty:()=>false,getSize:()=>({width:600,height:2000}),toDataURL:()=> 'data:image/png;base64,YWJj'};
  const session={fetch:async(url,init)=>{options=init;return new Response(new Uint8Array([1,2]),{headers:{'content-type':'image/jpeg'}});}};
  assert.equal(await fullImagePreview(session,{createFromBuffer:()=>image},'https://scontent.fbcdn.net/a.jpg'),'data:image/png;base64,YWJj');
  assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');assert.equal(options.cache,'force-cache');
});
test('only bounded PNG data URLs reach image elements',()=>{
  assert.equal(safePreview('https://tracker.example/image'),undefined);
  assert.equal(safePreview('data:image/svg+xml,<svg onload="bad"/>'),undefined);
  assert.equal(safePreview('data:image/png;base64,'+'a'.repeat(600000)),undefined);
  assert.equal(safePreview('data:image/png;base64,YWJj'),'data:image/png;base64,YWJj');
});
test('matching media keep their local preview, recycled image identities do not',()=>{
  const media={key:'media-1',kind:'image',description:'Example',preview:'data:image/png;base64,YWJj',cropped:true};
  const first=mergePosts([],[{id:'fb-post-1',text:'Example post',media:[media]}]);
  assert.equal(mergePosts(first,[{id:'fb-post-1',text:'Updated',media:[{...media,preview:undefined}]}])[0].media[0].preview,media.preview);
  assert.equal(mergePosts(first,[{id:'fb-post-1',text:'Updated',media:[{...media,key:'media-2',preview:undefined}]}])[0].media[0].preview,undefined);
});
