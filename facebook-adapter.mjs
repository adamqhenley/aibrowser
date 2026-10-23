export function isFacebook(value){try{return ['facebook.com','www.facebook.com','m.facebook.com'].includes(new URL(value).hostname);}catch{return false;}}

// Runs in an isolated Chromium world, reads only visible feed/article surfaces.
// It never accesses input values, cookies, storage, network, or account credentials.
export function visibleFacebookPosts(){
  const state=window.__aiBrowserFeed||(window.__aiBrowserFeed={ids:new WeakMap(),nodes:new Map(),next:0});
  const nodes=[...document.querySelectorAll('[role="feed"] [role="article"], [data-pagelet^="FeedUnit"], [role="main"] [role="article"]')];
  const outer=nodes.filter(node=>!nodes.some(parent=>parent!==node&&parent.contains(node)));
  const posts=[];
  for(const node of outer){
    const rect=node.getBoundingClientRect();
    if(rect.bottom<=0||rect.top>=innerHeight||rect.width<120||rect.height<40||node.closest('[role="dialog"],form'))continue;
    const text=(node.innerText||'').trim();if(text.length<40)continue;
    let id=state.ids.get(node);if(!id){id='fb-post-'+(++state.next);state.ids.set(node,id);}state.nodes.set(id,node);
    const sponsored=[...node.querySelectorAll('a,span')].some(el=>el.getClientRects().length&&((el.innerText||'').trim()==='Sponsored'||el.getAttribute('aria-label')==='Sponsored'));
    posts.push({id,text:text.slice(0,6000),sponsored});
    if(posts.length===8)break;
  }
  for(const [id,node] of state.nodes)if(!node.isConnected)state.nodes.delete(id);
  return posts;
}

export function mergePosts(previous,incoming,limit=30){
  const next=new Map(previous.map(post=>[post.id,post]));
  for(const post of incoming){if(!/^fb-post-\d+$/.test(post.id)||typeof post.text!=='string')continue;next.set(post.id,{id:post.id,text:post.text.slice(0,6000),sponsored:post.sponsored===true});}
  return [...next.values()].slice(-limit);
}
