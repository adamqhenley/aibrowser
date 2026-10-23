// Generic semantic extraction. Site mappings may supply selector hints, never code.
// This function is serialized into an isolated Chromium world.
export function extractVisibleEntries(hints={}){
  const textCache=new WeakMap(),styleCache=new WeakMap();
  // Read rendered text nodes, not innerText: some sites insert clipped labels
  // that innerText includes even though a sighted reader cannot see them.
  const visibleText=(root)=>{
    if(textCache.has(root))return textCache.get(root);
    const walker=document.createTreeWalker(root,4);const parts=[];let previousBlock=null,visited=0;
    for(let leaf=walker.nextNode();leaf;leaf=walker.nextNode()){
      if(++visited>4000)break;
      const value=leaf.textContent.replace(/[\u200b-\u200d\u2060\ufeff]/g,'');if(!value.trim())continue;
      let hidden=false,block=null;
      for(let el=leaf.parentElement;el;el=el.parentElement){
        if(!styleCache.has(el))styleCache.set(el,{style:getComputedStyle(el),box:el.getBoundingClientRect()});
        const {style,box}=styleCache.get(el);
        const clipped=(style.clip&&style.clip!=='auto')||(style.clipPath&&style.clipPath!=='none');
        const opaqueLink=el.tagName==='A'&&(el.textContent.match(/\u034f/g)||[]).length>=8;
        if(opaqueLink||el.matches('script,style,template,input,textarea,[contenteditable="true"],[role="toolbar"],button,[role="button"],[aria-hidden="true"]')||style.display==='none'||style.visibility==='hidden'||style.opacity==='0'||clipped||(style.display!=='contents'&&box.width<=1&&box.height<=1)){hidden=true;break;}
        if(!block&&/^(block|flex|grid|list-item)/.test(style.display))block=el;
        if(el===root)break;
      }
      if(hidden)continue;
      const range=document.createRange();range.selectNodeContents(leaf);
      if(![...range.getClientRects()].some(r=>r.width>1&&r.height>1))continue;
      if(parts.length&&block!==previousBlock)parts.push('\n');parts.push(value);previousBlock=block;
    }
    const text=parts.join('').split('\n').map(line=>line.replace(/\s+/g,' ').trim()).filter(Boolean).join('\n');textCache.set(root,text);return text;
  };
  const state=window.__aiBrowserFeed||(window.__aiBrowserFeed={ids:new WeakMap(),nodes:new Map(),next:0});
  state.mediaIds||=new WeakMap();state.nextMedia||=0;
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
    let text=visibleText(node);if(text.length<20)continue;
    const heading=node.querySelector('h2,h3,h4,[role="heading"]');
    const author=heading?visibleText(heading).slice(0,180):'';
    const media=[...node.querySelectorAll('video,img')].filter(el=>el.getBoundingClientRect().width>120&&el.getBoundingClientRect().height>80).slice(0,6).map((el,index)=>{
      let identity=state.mediaIds.get(el);if(!identity||identity.src!==el.currentSrc){identity={key:'media-'+(++state.nextMedia),src:el.currentSrc};state.mediaIds.set(el,identity);}
      // Reuse decoded image pixels when the page's CORS rules permit canvas.
      // A denied canvas read leaves full-image retrieval to the trusted process.
      if(index<3&&el.tagName==='IMG'&&!identity.canvasAttempted&&el.complete&&el.naturalWidth>0){
        identity.canvasAttempted=true;
        try{const canvas=document.createElement('canvas');const scale=Math.min(1,1000/el.naturalWidth,1000/el.naturalHeight);canvas.width=Math.max(1,Math.round(el.naturalWidth*scale));canvas.height=Math.max(1,Math.round(el.naturalHeight*scale));canvas.getContext('2d').drawImage(el,0,0,canvas.width,canvas.height);let preview=canvas.toDataURL('image/png');if(preview.length<=600000)identity.preview=preview;}catch{/* Never bypass cross-origin image protections. */}
      }
      return {key:identity.key,kind:el.tagName==='VIDEO'?'video':'image',description:(el.getAttribute('alt')||el.getAttribute('aria-label')||'').slice(0,300),imageUrl:el.tagName==='IMG'?el.currentSrc:undefined,...(identity.preview?{preview:identity.preview,cropped:false}: {})};
    });
    const truncated=[...node.querySelectorAll('button,[role="button"]')].some(el=>el.getClientRects().length&&/^See more$/i.test((el.innerText||'').trim()));
    let id=state.ids.get(node);if(!id){id='fb-post-'+(++state.next);state.ids.set(node,id);}state.nodes.set(id,node);
    // Only explicit labels count; a body mentioning advertising is not an ad.
    const sponsored=[...node.querySelectorAll('a,span')].some(el=>el.getClientRects().length&&/^(Sponsored|Ad)$/i.test(visibleText(el)))||Boolean(hints.adLinkSelector&&[...node.querySelectorAll(hints.adLinkSelector)].some(el=>el.getClientRects().length));
    posts.push({id,text:text.slice(0,6000),sponsored,author,media,truncated});if(posts.length===8)break;
  }
  for(const [id,node] of state.nodes)if(!node.isConnected)state.nodes.delete(id);
  return posts;
}
