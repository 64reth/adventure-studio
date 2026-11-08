import type {Page} from '../core/index';
import {registry,solve,type Puzzle,type Cell} from '../puzzles/index';
import {layout,type PrintProfile} from '../print/index';
export const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
const text=(x:number,y:number,s:string,size=14,extra='')=>`<text x="${x}" y="${y}" font-family="Open Sans, sans-serif" font-size="${size}" fill="#111" stroke="none" ${extra}>${esc(s)}</text>`;
const line=(x:number,y:number,X:number,Y:number)=>`<path d="M${x} ${y}L${X} ${Y}"/>`;
function wrapped(s:string,x:number,y:number,width:number,size=13){const words=s.split(/\s+/);let row='',out='',n=0;for(const w of words){if((row+' '+w).length>width&&row){out+=text(x,y+n*19,row,size);n++;row=w;}else row+=(row?' ':'')+w;}return out+text(x,y+n*19,row,size);}
function tower(x:number,y:number,scale=1){return `<g transform="translate(${x} ${y}) scale(${scale})" fill="white" stroke="#111" stroke-width="2"><path d="M0 25V0H10V9H20V0H30V9H40V0H50V25L46 30V90H4V30Z"/><path d="M20 90V67Q25 54 30 67V90M17 39V50H32V39ZM4 55H15M34 55H46M4 76H13M37 76H46"/></g>`;}
function tree(x:number,y:number,s=1){return `<g transform="translate(${x} ${y}) scale(${s})" fill="white" stroke="#111" stroke-width="2"><path d="M-4 40V65H4V40"/><path d="M0 0Q-24 3-19 20Q-36 28-23 42Q-7 50 0 42Q18 53 30 37Q39 23 20 17Q19 2 0 0Z"/><path d="M0 42V23M0 34L-11 25M0 30L11 21"/></g>`;}
function dragon(){return `<g transform="translate(390 9) scale(.75)" fill="white" stroke="#111" stroke-width="2.5"><path d="M20 54Q-10 10 25 0L53 23L90 4L82 40Q112 62 92 84Q61 98 37 77Q9 104-5 79Q13 89 20 54Z"/><path d="M23 31L-4 12L-8 50L20 54M66 28L68 12L78 19M48 81V94H35M72 85V97H59M87 57Q80 64 70 59"/><circle cx="78" cy="43" r="3" fill="black"/><path d="M30 12L30 30L43 35M14 18L14 36L23 44"/></g>`;}
export function scenery(kind:string,theme='Enchanted Kingdom'){const fantasy=theme==='Enchanted Kingdom';if(!fantasy)return `<g data-layer="artwork">${tree(25,8,.6)}${tree(500,9,.65)}${text(65,42,theme,18)}</g>`;return `<g data-layer="artwork">${tower(5,5,.7)}${tower(505,5,.7)}${kind==='cipher'?dragon():tree(443,7,.65)}<path d="M42 53Q110 10 175 42Q230 8 300 40Q355 10 413 43" fill="none" stroke="#111" stroke-width="1.5"/>${text(190,60,kind==='word-search'?'ROYAL ARCHIVES':kind==='reveal'?'THE OBSERVATORY':'ENCHANTED KINGDOM',11)}</g>`;}
function rune(code:string,x:number,y:number,s=1){const n=Number(code);return `<g transform="translate(${x} ${y}) scale(${s})" stroke="#111" fill="white" stroke-width="1.5"><path d="M0-10L9 0L0 10L-9 0Z"/>${[0,1,2,3,4].map((b)=>`<circle cx="${(b%3-1)*4}" cy="${b<3?-3:4}" r="1.2" fill="${(n+1)&(1<<b)?'#111':'white'}"/>`).join('')}</g>`;}
function symbol(name:string,x:number,y:number){const paths:Record<string,string>={Crown:'M-12 8L-15-8L-5-2L0-13L5-2L15-8L12 8ZM-12 12H12',Leaf:'M0 12Q-26-8 12-15Q24 10 0 12ZM-5 7L10-10',Star:'M0-16L5-5L17-5L8 3L11 16L0 9L-11 16L-8 3L-17-5L-5-5Z',Moon:'M7-15A16 16 0 1 0 7 15A19 19 0 0 1 7-15Z',Flame:'M0-17Q5-3 13 2Q20 18 0 18Q-19 16-10 2L-6 8Q-2 2 0-17Z'};return `<path transform="translate(${x} ${y})" d="${paths[name]}" fill="white" stroke="#111" stroke-width="2"/>`;}
export function puzzleSvg(p:Puzzle,solution=false){let out='';const answer=solve(p)[0];
 if(p.kind==='maze'){
 const size=Math.min(470/p.width,380/p.height),ox=(550-p.width*size)/2,oy=90;const edges=new Set(p.edges.flatMap(([a,b])=>[`${a}:${b}`,`${b}:${a}`]));out+=text(ox,oy-12,'START',12)+text(ox+p.width*size-45,oy+p.height*size+22,'EXIT',12);
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){const a=y*p.width+x,X=ox+x*size,Y=oy+y*size;if(y===0&&x!==0)out+=line(X,Y,X+size,Y);if(x===0)out+=line(X,Y,X,Y+size);if(x===p.width-1||!edges.has(`${a}:${a+1}`))out+=line(X+size,Y,X+size,Y+size);if(y===p.height-1?(x!==p.width-1):!edges.has(`${a}:${a+p.width}`))out+=line(X,Y+size,X+size,Y+size);}
 if(solution&&answer?.path)out+=`<polyline points="${answer.path.map(n=>`${ox+(n%p.width+.5)*size},${oy+(Math.floor(n/p.width)+.5)*size}`).join(' ')}" stroke="#555" stroke-width="4" fill="none"/>`;
 }
 if(p.kind==='route'){
 out+=`<rect x="60" y="85" width="430" height="300" rx="20" fill="white"/><path d="M60 85H490V385H60Z M275 385V335M275 200V130M190 235H80M350 235H470" stroke="#111" fill="none" stroke-width="8"/><circle cx="275" cy="235" r="65" fill="white" stroke="#111" stroke-width="2"/><circle cx="275" cy="235" r="45" fill="white" stroke="#111"/><path d="M260 250L275 210L290 250Z" fill="white" stroke="#111"/>`;
 out+=tree(390,140,.55)+tree(105,280,.5)+tower(380,290,.65)+tower(215,95,.45);
 for(const c of p.clues){out+=symbol(c.symbol,c.x,c.y)+text(c.x+22,c.y+5,String(c.value),16);if(solution)out+=`<circle cx="${c.x}" cy="${c.y}" r="24" fill="none" stroke="#777" stroke-width="3"/>`;}
 out+=text(250,412,'ENTER HERE',12);
 p.routes.forEach((r,i)=>{out+=text(35+(i%2)*270,442+Math.floor(i/2)*28,`${r.name} gate: ${r.code.join(' - ')}`,14,solution&&r.name===answer?.answer?'font-weight="bold" text-decoration="underline"':'');});
 out+=text(85,525,'Read clues in this order:',13);['Crown','Leaf','Star','Moon','Flame'].forEach((s,i)=>{out+=symbol(s,110+i*85,553);});
 }
 if(p.kind==='reveal'){
 const cell=Math.min(34,500/p.width),ox=(550-p.width*cell)/2,oy=130;
 out+=`<path d="M${ox-10} ${oy+7*cell+12}V${oy-20}Q275 15 ${ox+p.width*cell+10} ${oy-20}V${oy+7*cell+12}Z" fill="none" stroke="#111" stroke-width="4"/>`;
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){out+=`<rect x="${ox+x*cell}" y="${oy+y*cell}" width="${cell}" height="${cell}" fill="${solution&&p.mask[y][x]?'#d5a33d':'white'}"/>`+text(ox+(x+.5)*cell,oy+(y+.65)*cell,p.symbols[y][x],14,'text-anchor="middle"');}
 out+=text(85,445,'Colour every 2 and 4. Leave 1 and 3 white.',15)+text(85,478,'The three large letters reveal the password.',14)+text(85,515,'Password: ___ ___ ___',19);
 }
 if(p.kind==='word-search'){
 const cell=Math.min(30,430/p.size),ox=(550-p.size*cell)/2,oy=92;
 for(let y=0;y<p.size;y++)for(let x=0;x<p.size;x++){out+=`<rect x="${ox+x*cell}" y="${oy+y*cell}" width="${cell}" height="${cell}" fill="white" stroke-width=".6"/>`+text(ox+(x+.5)*cell,oy+(y+.68)*cell,p.grid[y][x],16,'text-anchor="middle"');}
 if(solution&&answer?.words)for(const cells of Object.values(answer.words)){const a=cells[0],b=cells[cells.length-1];out+=`<path d="M${ox+(a[0]+.5)*cell} ${oy+(a[1]+.5)*cell}L${ox+(b[0]+.5)*cell} ${oy+(b[1]+.5)*cell}" stroke="#666" stroke-width="18" opacity=".3" stroke-linecap="round"/>`;}
 out+=wrapped(p.words.join(' • '),50,oy+p.size*cell+32,52,15)+text(50,oy+p.size*cell+88,'When all words are found, collect the OAK key.',14);
 }
 if(p.kind==='cipher'){
 out+=text(42,105,'Use the rune key to decode the next destination.',15);
 const letters=Object.keys(p.key);letters.forEach((letter,i)=>{const x=45+(i%9)*57,y=145+Math.floor(i/9)*48;out+=rune(p.key[letter],x,y)+text(x+15,y+5,letter,14);});
 out+=text(42,285,'Gate: ______   Password: ______   Key: ______',13);
 p.encoded.forEach((word,wi)=>{const y=330+wi*65;word.forEach((code,i)=>{const x=75+i*37;out+=rune(code,x,y,1.3)+text(x,y+32,solution?Object.entries(p.key).find(([,v])=>v===code)![0]:'_',18,'text-anchor="middle"');});});
 }
 return `<g data-layer="puzzle" fill="none" stroke="#111" stroke-width="1.5">${out}</g>`;
}
export function compose(page:Page,options:{solution?:boolean;profile?:PrintProfile;count?:number;guides?:boolean;artwork?:boolean}={}){
 const profile=options.profile??'no-bleed',count=options.count??Math.max(page.number,5),l=layout(profile,page.number,count);const p=registry[page.mechanic].generate({...page.config,difficulty:page.difficulty},page.seed);const safe=l.safe;const sx=safe.width*72/550,sy=(safe.height*72-175)/580,scale=Math.min(sx,sy);const x=safe.x*72,y=safe.y*72;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${l.width}in" height="${l.height}in" viewBox="0 0 ${l.width*72} ${l.height*72}" role="img" aria-label="${esc(page.title)}"><rect width="100%" height="100%" fill="white"/><g transform="translate(${x} ${y})">${text(0,16,'EXPLORE, COLOUR &amp; SOLVE'.replace('&amp;','&'),10)}${text(0,47,page.title,24,'font-weight="bold"')}${wrapped(page.story,0,71,73,12)}${wrapped(page.instructions,0,117,71,13)}<g transform="translate(${(safe.width*72-550*scale)/2} 155) scale(${scale})">${options.artwork===false?'':scenery(p.kind,page.scene.theme)}${puzzleSvg(p,options.solution)}</g>${text(0,safe.height*72-18,options.solution?`ANSWER: ${solve(p)[0]?.answer??'INVALID'}`:'Answer: __________________________________',13)}${text(safe.width*72-8,safe.height*72-2,String(page.number),10,'text-anchor="end"')}</g>${options.guides?`<rect x="${l.trim.x*72}" y="${l.trim.y*72}" width="612" height="792" stroke="#0085a1" stroke-dasharray="5 4" fill="none"/><rect x="${x}" y="${y}" width="${safe.width*72}" height="${safe.height*72}" stroke="#cc6a00" stroke-dasharray="3 3" fill="none"/>`:''}</svg>`;
}
export function blankPage(profile:PrintProfile='no-bleed'){const l=layout(profile,1,5);return `<svg xmlns="http://www.w3.org/2000/svg" width="${l.width}in" height="${l.height}in" viewBox="0 0 ${l.width*72} ${l.height*72}"><rect width="100%" height="100%" fill="white"/></svg>`;}
