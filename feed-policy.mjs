// Deterministic, inspectable session rules. No inference, storage, or requests.
export function phrases(value){return [...new Set(String(value||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean))].slice(0,20);}
function contains(text,term){const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`,'iu').test(text);}
export function evaluateFeed(entries,rules={}){
  const topics=phrases(rules.topics),defer=phrases(rules.defer),authors=phrases(rules.authors);
  const seen=new Map();
  const results=entries.map((entry,index)=>{
    const text=[entry.author,entry.text,...(entry.media||[]).map(m=>m.description)].join('\n').toLowerCase();
    const matches=topics.filter(term=>contains(text,term));
    const reasons=[],exclusions=[];const key=entry.text.replace(/\s+/g,' ').trim().toLowerCase();
    const duplicateOf=key.length>=40?seen.get(key):undefined;if(key.length>=40&&!duplicateOf)seen.set(key,entry.id);
    let score=matches.length*10;
    if(matches.length)reasons.push(`Matches your topics: ${matches.join(', ')}`);
    if(authors.some(term=>contains(entry.author||'',term))){score+=20;reasons.push('Matches a source you prioritized');}
    if(rules.kept?.has(entry.id)){score+=100;reasons.push('You kept this post');}
    if(rules.aside?.has(entry.id))exclusions.push('You set this post aside');
    const deferred=defer.filter(term=>contains(text,term));if(deferred.length)exclusions.push(`Matches your deferred terms: ${deferred.join(', ')}`);
    if(rules.hideAds&&entry.sponsored)exclusions.push('Ad identified by page metadata');
    if(rules.onlyTopics&&topics.length&&!matches.length)exclusions.push('No match for your selected topics');
    if(rules.collapseDuplicates&&duplicateOf)exclusions.push(`Repeated text; grouped under ${duplicateOf}`);
    if(rules.query&&!text.includes(rules.query.toLowerCase().trim()))exclusions.push('Does not match your local search');
    return {id:entry.id,index,score,matches,duplicateOf,reasons:reasons.length?reasons:['Original encountered order; no priority rule matched'],exclusions};
  });
  if(rules.order==='relevance')results.sort((a,b)=>b.score-a.score||a.index-b.index);
  let included=0;const limit=Number.isInteger(rules.limit)&&rules.limit>0?rules.limit:Infinity;
  for(const item of results){if(!item.exclusions.length){if(included>=limit)item.exclusions.push('Outside your frozen edition limit');else included++;}item.included=!item.exclusions.length;}
  return results;
}
export function buildSessionGraph(entries,topicsValue){
  const nodes=new Map(),edges=[];const add=(id,type,label)=>{nodes.set(id,{id,type,label});return id;};
  const topics=phrases(topicsValue);
  for(const entry of entries){
    const post=add(entry.id,'post',entry.author||'Captured post');
    if(entry.author){const source=add('source:'+entry.author.toLowerCase(),'source',entry.author);edges.push({from:post,to:source,type:'displayed-under'});}
    for(const topic of topics){if(contains(entry.text+'\n'+(entry.author||''),topic)){const id=add('topic:'+topic,'topic',topic);edges.push({from:post,to:id,type:'text-match'});}}
  }
  return {nodes:[...nodes.values()],edges};
}
export function facebookSearchUrl(query){const text=String(query||'').trim();if(!text||text.length>300)throw Error('Enter a search of 1–300 characters.');return 'https://www.facebook.com/search/posts/?q='+encodeURIComponent(text);}
