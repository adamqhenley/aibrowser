import {safePreview} from './feed-media.mjs';
export function isFacebook(value){try{return ['facebook.com','www.facebook.com','m.facebook.com'].includes(new URL(value).hostname);}catch{return false;}}
export {extractVisibleEntries as visibleFacebookPosts} from './dom-adapter.mjs';

export function mergePosts(previous,incoming,limit=30){
  const next=new Map(previous.map(post=>[post.id,post]));
  for(const post of incoming){
    if(!/^fb-post-\d+$/.test(post.id)||typeof post.text!=='string')continue;
    const entry={id:post.id,text:post.text.slice(0,6000),sponsored:post.sponsored===true};
    if(typeof post.author==='string')entry.author=post.author.slice(0,180);
    if(typeof post.truncated==='boolean')entry.truncated=post.truncated;
    if(Array.isArray(post.media))entry.media=post.media.slice(0,6).filter(m=>m&&['image','video'].includes(m.kind)&&typeof m.description==='string').map(m=>{
      const item={kind:m.kind,description:m.description.slice(0,300)};
      if(/^media-\d+$/.test(m.key))item.key=m.key;
      const previousMedia=next.get(post.id)?.media?.find(old=>old.key&&old.key===item.key);
      const preview=safePreview(m.preview)||safePreview(previousMedia?.preview);
      if(preview){item.preview=preview;item.cropped=safePreview(m.preview)?m.cropped===true:previousMedia.cropped;}
      return item;
    });
    next.set(post.id,entry);
  }
  return [...next.values()].slice(-limit);
}
