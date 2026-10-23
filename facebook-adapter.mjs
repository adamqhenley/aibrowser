export function isFacebook(value){try{return ['facebook.com','www.facebook.com','m.facebook.com'].includes(new URL(value).hostname);}catch{return false;}}
export {extractVisibleEntries as visibleFacebookPosts} from './dom-adapter.mjs';

export function mergePosts(previous,incoming,limit=30){
  const next=new Map(previous.map(post=>[post.id,post]));
  for(const post of incoming){if(!/^fb-post-\d+$/.test(post.id)||typeof post.text!=='string')continue;next.set(post.id,{id:post.id,text:post.text.slice(0,6000),sponsored:post.sponsored===true});}
  return [...next.values()].slice(-limit);
}
