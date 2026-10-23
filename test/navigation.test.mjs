import {test} from 'node:test';import assert from 'node:assert/strict';
import {webUrl,addressUrl} from '../navigation.mjs';
test('browsing and external links reject local and OS protocols',()=>{
  for(const url of ['file:///etc/passwd','javascript:alert(1)','data:text/html,hi','mailto:someone@example.com','smb://host/share','https://user:password@example.com'])assert.equal(webUrl(url),null);
  assert.equal(webUrl('https://example.com/a?q=1'),'https://example.com/a?q=1');
  assert.equal(webUrl('http://localhost:4317/'),'http://localhost:4317/');
});
test('address input permits web hosts and search, not explicit unsafe schemes',()=>{
  assert.equal(addressUrl('example.com'),'https://example.com/');
  assert.equal(addressUrl('localhost:4317'),'https://localhost:4317/');
  assert.match(addressUrl('a search with spaces'),/^https:\/\/www.google.com\/search\?q=/);
  for(const url of ['file:///etc/passwd','javascript:alert(1)','https://u:p@example.com'])assert.throws(()=>addressUrl(url));
});
