const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('dist/app.js','utf8');
function boot(saved){
  const data=new Map(saved===undefined?[]:[['flirtlive',saved]]);
  const nodes=new Map();
  function element(){return {innerHTML:'',textContent:'',value:'',children:[],classList:{add(){},remove(){},toggle(){}},addEventListener(){},append(...items){this.children.push(...items);this.textContent+=items.map(x=>x.textContent||'').join('')},replaceChildren(){this.children=[]},scrollIntoView(){}}}
  const document={querySelector(s){if(!nodes.has(s))nodes.set(s,element());return nodes.get(s)},querySelectorAll(){return []},createElement:element,createTextNode(text){return {textContent:text}},addEventListener(){}};
  const context=vm.createContext({document,localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},location:{hash:'#home'},window:{addEventListener(){},scrollTo(){}},navigator:{},setTimeout(){},clearTimeout(){},console});
  vm.runInContext(source,context);
  return {run:s=>vm.runInContext(s,context),nodes,data};
}
test('all routes render and discovery filters select relevant hosts',()=>{
 const b=boot(); for(const route of ['home','discover','following','room/1','top','coins','messages','profile']){b.run(`location.hash='#${route}';render()`);assert.ok(b.nodes.get('#app').innerHTML.length>100,route)}
 assert.equal(b.run("query='sofia';category='All live';filtered().length"),1);
 assert.equal(b.run("query='';category='Gaming';filtered().length"),2);
 assert.equal(b.run("query='no-match';filtered().length"),0);
});
test('wallet gift flow updates both balances and persists across reload',()=>{
 const b=boot();b.run("location.hash='#room/1';room(1);sendGift(0)");
 assert.equal(b.run('state.coins'),1240);assert.equal(b.run('state.spent'),10);
 assert.equal(b.nodes.get('#room-balance').textContent,'1,240');
 const reload=boot(b.data.get('flirtlive'));assert.equal(reload.run('state.coins'),1240);
 b.run('buyCoins(500)');assert.equal(b.run('state.coins'),1740);
 b.run('state.coins=0;sendGift(5)');assert.equal(b.run('state.coins'),0);assert.equal(b.run('state.spent'),10);
});
test('chat survives follow and reload; empty chat is ignored',()=>{
 const b=boot();b.run("location.hash='#room/1';room(1);document.querySelector('#chat-input').value='Hello demo'");b.run('sendChat({preventDefault(){}})');
 assert.ok(b.data.get('flirtlive').includes('Hello demo'));
 b.run('follow(1)');assert.equal(b.run('state.following.includes(1)'),true);
 const reload=boot(b.data.get('flirtlive'));reload.run('room(1)');assert.ok(reload.nodes.get('#chat').children.some(x=>x.textContent.includes('Hello demo')));
 b.nodes.get('#chat-input').value='   ';const count=b.nodes.get('#chat').children.length;b.run('sendChat({preventDefault(){}})');assert.equal(b.nodes.get('#chat').children.length,count);
});
test('profile named fields save correctly and reject blank display names',()=>{
 const b=boot();b.run("saveProfile({preventDefault(){},target:{elements:{namedItem(n){return {value:n==='name'?' Demo Tester ':' Test bio '}}}}})");
 assert.equal(b.run('state.name'),'Demo Tester');assert.equal(b.run('state.bio'),'Test bio');
 b.run("saveProfile({preventDefault(){},target:{elements:{namedItem(){return {value:'   '}}}}})");assert.equal(b.run('state.name'),'Demo Tester');
});
test('corrupt storage recovers and persisted chat renders as text',()=>{
 assert.equal(boot('{broken').run('state.coins'),1250);
 assert.equal(boot('{"coins":-1}').run('state.coins'),1250);
 const b=boot();b.run("state.chats={1:['<img src=x onerror=alert(1)>']};room(1)");assert.equal(b.nodes.get('#chat').children[0].textContent,'<img src=x onerror=alert(1)>');
});
