export function validateAIML(doc,pageUrl){
  if(!doc||doc.version!=='aiml/0.1'||!doc.source||!Array.isArray(doc.blocks)||!Array.isArray(doc.actions))throw Error('Invalid AIML document');
  const source=new URL(doc.source.canonicalUrl);const page=new URL(pageUrl);
  if(source.origin!==page.origin||!['https:','http:'].includes(source.protocol))throw Error('Source must match the current origin');
  if(typeof doc.source.title!=='string'||typeof doc.source.publisher!=='string'||typeof doc.source.revision!=='string')throw Error('Missing provenance');
  if(doc.blocks.length>200||doc.blocks.length<1)throw Error('Invalid block count');
  const ids=new Set();for(const b of doc.blocks){if(!/^[a-z][a-z0-9-]{0,63}$/.test(b.id)||ids.has(b.id)||!['heading','paragraph','claim','quote','metric'].includes(b.type)||typeof b.text!=='string'||!b.text.length||b.text.length>12000||!/^#[a-zA-Z][a-zA-Z0-9_-]*$/.test(b.sourceAnchor))throw Error('Invalid content block');ids.add(b.id);}
  // Copy only known display fields. Declared capabilities never execute in this consumer.
  return {version:doc.version,source:{title:doc.source.title,publisher:doc.source.publisher,revision:doc.source.revision,canonicalUrl:source.href},blocks:doc.blocks.map(({id,type,text,sourceAnchor})=>({id,type,text,sourceAnchor})),actionCount:doc.actions.length};
}
