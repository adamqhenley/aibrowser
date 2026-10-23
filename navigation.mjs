// Ordinary browsing must never launch local files or operating-system protocols.
export function webUrl(value){
  try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?url.href:null;}catch{return null;}
}
export function addressUrl(value){
  const input=String(value??'').trim();
  if(!input)return 'https://example.org/';
  if(/^[a-z][a-z\d+.-]*:/i.test(input)&&!/^https?:/i.test(input)&&!/^localhost:\d/i.test(input))throw Error('Only HTTP and HTTPS browsing is supported.');
  const candidate=webUrl(input.includes('://')?input:`https://${input}`);
  if(candidate)return candidate;
  if(input.includes('://'))throw Error('Enter an HTTP or HTTPS address without embedded credentials.');
  return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
}
