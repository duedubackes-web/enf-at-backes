import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const manifest=JSON.parse(readFileSync('public/manifest.webmanifest','utf8'));
const sw=readFileSync('public/sw.js','utf8');
const offline=readFileSync('public/offline.html','utf8');
test('PWA manifest identifies the app and uses standalone display',()=>{
 assert.equal(manifest.lang,'pt-BR');assert.equal(manifest.display,'standalone');
 assert.equal(manifest.start_url,'/');assert.ok(manifest.icons.length);
});
test('service worker only caches safe offline screen, never APIs or navigation responses',()=>{
 assert.match(sw,/cache\.add\(OFFLINE_PAGE\)/);
 assert.match(sw,/req\.mode!==['"]navigate['"]/);
 assert.match(sw,/event\.respondWith\(fetch\(req\)\.catch/);
 assert.doesNotMatch(sw,/cache\.put\s*\(/);
});
test('offline fallback discloses no patient content',()=>{
 assert.match(offline,/Você está sem conexão/);
 assert.match(offline,/dados assistenciais.*não ficam disponíveis offline/);
});
