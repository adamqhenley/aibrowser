// Generic semantic extraction. Site mappings may supply selector hints, never code.
// This function is serialized into an isolated Chromium world.
export function extractVisibleEntries(hints={}){
  const state=window.__aiBrowserFeed||(window.__aiBrowserFeed={ids:new WeakMap(),nodes:new Map(),next:0});
  const candidates=[...document.querySelectorAll('article,[role="article"],[data-pagelet^="FeedUnit"]')];
  if(hints.postMenuSelector){
    for(const menu of document.querySelectorAll(hints.postMenuSelector)){
      let node=menu.parentElement;
      for(let level=0;node&&level<14;level++,node=node.parentElement){
        const rect=node.getBoundingClientRect();
        if(rect.width>innerWidth||node===document.body)break;
        if(node.querySelectorAll(hints.postMenuSelector).length!==1)break;
        if(node.querySelector('h2,h3,h4,[role="heading"]')&&(node.innerText||'').trim().length>=40&&rect.height>=100){candidates.push(node);break;}
      }
    }
  }
  const nodes=[...new Set(candidates)];
  const outer=nodes.filter(node=>!nodes.some(parent=>parent!==node&&parent.contains(node)));
  const posts=[];
  for(const node of outer){
    const rect=node.getBoundingClientRect();
    if(rect.bottom<=0||rect.top>=innerHeight||rect.width<120||rect.height<40||node.closest('[role="dialog"],form'))continue;
    let text=(node.innerText||'').trim();if(text.length<40)continue;
    const media=[...node.querySelectorAll('video,img')].some(el=>el.getBoundingClientRect().width>120&&el.getBoundingClientRect().height>80);
    if(media)text+='\n[Media present: images/video are not transcribed in this text view.]';
    let id=state.ids.get(node);if(!id){id='fb-post-'+(++state.next);state.ids.set(node,id);}state.nodes.set(id,node);
    const sponsored=[...node.querySelectorAll('a,span')].some(el=>el.getClientRects().length&&((el.innerText||'').replace(/[\u200b-\u200d\ufeff]/g,'').trim()==='Sponsored'||el.getAttribute('aria-label')==='Sponsored'));
    posts.push({id,text:text.slice(0,6000),sponsored});if(posts.length===8)break;
  }
  for(const [id,node] of state.nodes)if(!node.isConnected)state.nodes.delete(id);
  return posts;
}
