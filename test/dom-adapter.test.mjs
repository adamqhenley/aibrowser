import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {mergePosts,visibleFacebookPosts} from '../facebook-adapter.mjs';

// Geometry fixture includes clipped labels which innerText otherwise leaks.
function fixture({top=10,form=false,label='',body='A visible post with enough content to extract safely.',hint=false,media=false,truncated=false,contents=false,clip=false,opaque=false,adLink=false,decoded=false,tainted=false}={}){
  const box={top,bottom:top+200,width:500,height:200};
  const element=(text='',extra={})=>({innerText:text,textContent:text,isConnected:true,tagName:'SPAN',parentElement:null,
    getBoundingClientRect:()=>box,getClientRects:()=>[box],getAttribute:()=>null,matches:()=>false,...extra});
  const heading=element('Example author',contents?{getBoundingClientRect:()=>({...box,width:0,height:0})}:{}),labelNode=element(label);
  const noise=element('Facebook',{getBoundingClientRect:()=>({...box,width:clip?100:1,height:clip?20:1})});
  if(opaque){noise.tagName='A';noise.textContent='x\u034f'.repeat(10);noise.getBoundingClientRect=()=>box;}
  const button=element('See more',{matches:()=>true});
  const image=element('',{tagName:'IMG',complete:decoded,naturalWidth:600,naturalHeight:400,currentSrc:'https://example.test/already-loaded.png',getAttribute:key=>key==='alt'?'A page-provided image caption':null});
  const post=element('Example author\nFacebook\n'+body,{contains:()=>false,closest:()=>form?{}:null,
    querySelector:()=>heading,querySelectorAll:selector=>selector==='[data-menu]'?[menu]:selector==='[data-ad]'?adLink?[labelNode]:[]:selector==='video,img'?media?[image]:[]:selector==='a,span'?label?[labelNode]:[]:selector==='button,[role="button"]'?truncated?[button]:[]:[]});
  heading.parentElement=post;labelNode.parentElement=post;noise.parentElement=post;button.parentElement=post;
  post.leaves=[{textContent:'Example author',parentElement:heading},{textContent:'Facebook',parentElement:noise},
    {textContent:body,parentElement:post},...(label?[{textContent:label,parentElement:labelNode}]:[]),...(truncated?[{textContent:'See more',parentElement:button}]:[])];
  heading.leaves=[post.leaves[0]];labelNode.leaves=post.leaves.filter(leaf=>leaf.parentElement===labelNode);
  const menu={parentElement:post};
  const context={window:{},innerWidth:600,innerHeight:800,getComputedStyle:el=>({display:el===post?'block':el===heading&&contents?'contents':'inline',visibility:'visible',opacity:'1',clip:el===noise&&clip?'rect(0px,0px,0px,0px)':'auto',clipPath:'none'}),
    document:{body:{},querySelectorAll:selector=>hint?(selector==='[data-menu]'?[menu]:[]):[post],
      createElement:()=>({getContext:()=>({drawImage(){}}),toDataURL:()=>{if(tainted)throw Error('Cross-origin canvas');return 'data:image/png;base64,YWJj';}}),
      createTreeWalker:root=>{let i=0;return {nextNode:()=>root.leaves?.[i++]||null};},
      createRange:()=>({selectNodeContents(){},getClientRects:()=>[{width:100,height:16}]})}};
  return ()=>runInNewContext(`(${visibleFacebookPosts.toString()})({${hint?"postMenuSelector:'[data-menu]',":''}adLinkSelector:'[data-ad]'})`,context);
}
test('captures visible articles only and retains identity across polls',()=>{const read=fixture();assert.equal(read()[0].id,read()[0].id);assert.equal(fixture({top:1200})().length,0);assert.equal(fixture({form:true})().length,0);});
test('selector hints find bounded post containers without article roles',()=>{assert.equal(fixture({hint:true})().length,1);});
test('removes clipped labels without removing source body',()=>{const post=fixture()()[0];assert.doesNotMatch(post.text,/Facebook/);assert.match(post.text,/visible post/);assert.equal(post.author,'Example author');});
test('display:contents headings retain text despite having no layout box',()=>{assert.equal(fixture({contents:true})()[0].author,'Example author');});
test('CSS-clipped text is excluded even with nonzero text geometry',()=>{assert.doesNotMatch(fixture({clip:true})()[0].text,/Facebook/);});
test('opaque link text is omitted while ordinary prose survives',()=>{const post=fixture({opaque:true})()[0];assert.doesNotMatch(post.text,/Facebook/);assert.match(post.text,/visible post/);});
test('declarative site hint recognizes explicit ad-link metadata',()=>{assert.equal(fixture({adLink:true})()[0].sponsored,true);});
test('recognizes only explicit Ad or Sponsored labels',()=>{for(const label of ['Sponsored','\u2060 Ad','Ad'])assert.equal(fixture({label})()[0].sponsored,true);assert.equal(fixture({body:'I work in advertising and have opinions about Sponsored posts.'})()[0].sponsored,false);});
test('preserves media descriptions and flags truncated source',()=>{const post=fixture({media:true,truncated:true})()[0];assert.equal(post.media[0].description,'A page-provided image caption');assert.equal(post.truncated,true);assert.doesNotMatch(post.text,/See more/);});
test('decoded images reuse pixels and remote URLs never reach display metadata',()=>{const post=fixture({media:true,decoded:true})()[0];assert.equal(post.media[0].preview,'data:image/png;base64,YWJj');assert.equal(post.media[0].cropped,false);assert.doesNotMatch(JSON.stringify(mergePosts([],[post])),/https:/);});
test('cross-origin canvas denial leaves text and complete image reference available',()=>{const post=fixture({media:true,decoded:true,tainted:true})()[0];assert.equal(post.media[0].preview,undefined);assert.match(post.media[0].imageUrl,/already-loaded/);assert.match(post.text,/visible post/);});
test('bounds and validates metadata crossing the adapter boundary',()=>{const post=mergePosts([],[{id:'fb-post-1',text:'test',author:'a'.repeat(500),truncated:true,media:[{kind:'image',description:'d'.repeat(500)},{kind:'script',description:'bad'}]}])[0];assert.equal(post.author.length,180);assert.equal(post.media.length,1);assert.equal(post.media[0].description.length,300);});
