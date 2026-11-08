import {z} from 'zod';
import type {Mechanic} from '../core/index';
export type Cell=[number,number];
export type Maze={kind:'maze';width:number;height:number;edges:[number,number][];start:number;end:number};
export type Route={kind:'route';clues:{symbol:string;value:number;x:number;y:number}[];routes:{name:string;code:number[]}[]};
export type Reveal={kind:'reveal';width:number;height:number;symbols:string[][];mask:boolean[][];answer:string};
export type WordSearch={kind:'word-search';size:number;grid:string[][];words:string[];directions:Cell[];reward:string};
export type Cipher={kind:'cipher';key:Record<string,string>;encoded:string[][]};
export type Puzzle=Maze|Route|Reveal|WordSearch|Cipher;
export type Solution={answer:string;path?:number[];cells?:Cell[];words?:Record<string,Cell[]>};
export type Validation={valid:boolean;errors:string[];solutions:number};
export type Config={difficulty?:'gentle'|'standard'|'challenging';size?:number;words?:string[];message?:string;answer?:string;diagonal?:boolean};
const Configuration=z.object({difficulty:z.enum(['gentle','standard','challenging']).optional(),size:z.number().int().min(6).max(20).optional(),words:z.array(z.string().regex(/^[A-Z]{3,12}$/)).min(1).max(10).optional(),message:z.string().regex(/^[A-Z ]{3,80}$/).optional(),answer:z.enum(['SUN','KEY']).optional(),diagonal:z.boolean().optional()}).strict();
export function random(seed:string){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function shuffle<T>(items:T[],rng:()=>number){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export interface PuzzleGenerator {id:Mechanic;version:string;generate(config:Config,seed:string):Puzzle;solve(puzzle:Puzzle):Solution[];validate(puzzle:Puzzle,solution?:Solution):Validation;renderBlueprint(puzzle:Puzzle):{bounds:{width:number;height:number};protectedGeometry:Puzzle}}
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const glyphs:Record<string,string[]>= {S:['111','100','111','001','111'],U:['101','101','101','101','111'],N:['1001','1101','1011','1001','1001'],K:['101','110','100','110','101'],E:['111','100','110','100','111'],Y:['101','101','010','010','010']};
export function revealMask(answer:string){const rows=Array.from({length:7},()=>[] as boolean[]);for(const char of answer){const glyph=glyphs[char];if(!glyph)throw new Error('Unsupported reveal letter');for(let y=0;y<7;y++)rows[y].push(false,...Array.from({length:glyph[0].length},(_,x)=>y>0&&y<6&&glyph[y-1][x]==='1'));}rows.forEach(r=>r.push(false));return rows;}
function generate(kind:Mechanic,raw:Config,seed:string):Puzzle{
 const c=Configuration.parse(raw),rng=random(seed);if(!seed.trim())throw new Error('Seed is required');
 if(kind==='maze'){
 const w=c.size??(c.difficulty==='gentle'?8:c.difficulty==='challenging'?16:12),h=w,visited=new Set([0]),stack=[0],edges:[number,number][]=[];
 while(stack.length){const a=stack[stack.length-1],x=a%w,y=Math.floor(a/w);const next=shuffle([x>0?a-1:-1,x<w-1?a+1:-1,y>0?a-w:-1,y<h-1?a+w:-1].filter(n=>n>=0&&!visited.has(n)),rng)[0];if(next===undefined){stack.pop();continue;}edges.push([a,next]);visited.add(next);stack.push(next);}
 return {kind,width:w,height:h,edges,start:0,end:w*h-1};
 }
 if(kind==='route'){
 const values=shuffle([1,2,3,4,5],rng),clues=['Crown','Leaf','Star','Moon','Flame'].map((symbol,i)=>({symbol,value:values[i],x:[115,325,445,180,440][i],y:[115,125,205,270,350][i]}));
 const codes=[values,...Array.from({length:3},(_,i)=>values.map((n,j)=>j===i?(n%5)+1:n))];
 return {kind,clues,routes:shuffle(codes,rng).map((code,i)=>({name:['North','East','South','West'][i],code}))};
 }
 if(kind==='reveal'){
 const answer=c.answer??'SUN',mask=revealMask(answer);return {kind,width:mask[0].length,height:mask.length,mask,answer,symbols:mask.map(row=>row.map(bit=>bit?(rng()>.5?'2':'4'):(rng()>.5?'1':'3')))};
 }
 if(kind==='word-search'){
 const words=c.words??['DRAGON','CASTLE','WIZARD','CROWN','MAGIC','TOWER'];if(new Set(words).size!==words.length)throw new Error('Words must be distinct');const size=c.size??12;if(words.some(w=>w.length>size))throw new Error('Word exceeds grid');const directions:Cell[]=c.diagonal?[[1,0],[0,1],[1,1],[-1,1]]:[[1,0],[0,1]];
 for(let attempt=0;attempt<200;attempt++){
 const grid=Array.from({length:size},()=>Array<string>(size).fill(''));let failed=false;
 for(const word of [...words].sort((a,b)=>b.length-a.length)){
 const candidates=shuffle(Array.from({length:size*size},(_,n)=>[n%size,Math.floor(n/size)] as Cell),rng);let placed=false;
 for(const [x,y] of candidates){for(const [dx,dy] of shuffle(directions,rng)){const endX=x+dx*(word.length-1),endY=y+dy*(word.length-1);if(endX<0||endX>=size||endY>=size)continue;if([...word].every((char,i)=>!grid[y+dy*i][x+dx*i]||grid[y+dy*i][x+dx*i]===char)){[...word].forEach((char,i)=>grid[y+dy*i][x+dx*i]=char);placed=true;break;}}if(placed)break;}if(!placed){failed=true;break;}}
 if(failed)continue;grid.forEach(row=>row.forEach((char,i)=>{if(!char)row[i]=alphabet[Math.floor(rng()*26)];}));const p:WordSearch={kind,size,grid,words,directions,reward:'OAK'};const found=scanWords(p);if(words.every(w=>found[w].length===1))return p;
 }throw new Error('Could not construct an unambiguous word search; try another seed');
 }
 const key=Object.fromEntries([...alphabet].map((letter,i)=>[letter,shuffle([...alphabet],random(seed+'-key')).indexOf(letter).toString().padStart(2,'0')]));
 return {kind:'cipher',key,encoded:(c.message??'FOLLOW THE RIVER').split(' ').map(w=>[...w].map(char=>key[char]))};
}
export function scanWords(p:WordSearch):Record<string,Cell[][]>{
 const allDirs:Cell[]=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];
 return Object.fromEntries(p.words.map(word=>{const matches:Cell[][]=[];for(let y=0;y<p.size;y++)for(let x=0;x<p.size;x++)for(const [dx,dy] of allDirs){const cells=[...word].map((_,i)=>[x+dx*i,y+dy*i] as Cell);if(cells.every(([cx,cy],i)=>p.grid[cy]?.[cx]===word[i]))matches.push(cells);}return [word,matches];}));
}
export function solve(p:Puzzle):Solution[]{
 if(p.kind==='maze'){
 const adj=Array.from({length:p.width*p.height},()=>[] as number[]);for(const [a,b] of p.edges){if(!adj[a]||!adj[b])return [];adj[a].push(b);adj[b].push(a);}const q=[p.start],parent=new Map<number,number>([[p.start,-1]]);for(let i=0;i<q.length;i++){for(const n of adj[q[i]])if(!parent.has(n)){parent.set(n,q[i]);q.push(n);}}if(!parent.has(p.end))return [];const path:number[]=[];let at=p.end;while(at!==-1){path.unshift(at);at=parent.get(at)!;}return [{answer:`${path.length-1} steps`,path}];
 }
 if(p.kind==='route'){return p.routes.filter(r=>r.code.every((v,i)=>v===p.clues[i]?.value)).map(r=>({answer:r.name}));}
 if(p.kind==='reveal'){const cells:Cell[]=[];p.symbols.forEach((row,y)=>row.forEach((s,x)=>{if(Number(s)%2===0)cells.push([x,y]);}));const actual=p.symbols.map(row=>row.map(s=>Number(s)%2===0));const answer=['SUN','KEY'].find(a=>JSON.stringify(revealMask(a))===JSON.stringify(actual));return answer?[{answer,cells}]:[];}
 if(p.kind==='word-search'){const found=scanWords(p);if(p.words.some(w=>found[w].length!==1))return [];return [{answer:p.reward,words:Object.fromEntries(p.words.map(w=>[w,found[w][0]]))}];}
 const reverse=Object.fromEntries(Object.entries(p.key).map(([a,b])=>[b,a]));if(Object.keys(reverse).length!==26)return [];if(p.encoded.flat().some(code=>!reverse[code]))return [];return [{answer:p.encoded.map(word=>word.map(code=>reverse[code]).join('')).join(' ')}];
}
export function validate(p:Puzzle,supplied?:Solution):Validation{
 const errors:string[]=[];const solutions=solve(p);if(solutions.length!==1)errors.push('Expected exactly one solution');
 if(supplied&&JSON.stringify(supplied)!==JSON.stringify(solutions[0]))errors.push('Answer key does not match independent solver');
 if(p.kind==='maze'){
 const count=p.width*p.height;if(p.edges.length!==count-1)errors.push('Maze must be a spanning tree');const adj=Array.from({length:count},()=>[] as number[]);for(const [a,b] of p.edges){if(!adj[a]||!adj[b]||!(Math.abs(a-b)===p.width||(Math.floor(a/p.width)===Math.floor(b/p.width)&&Math.abs(a-b)===1))){errors.push('Invalid maze edge');continue;}adj[a].push(b);adj[b].push(a);}const seen=new Set([p.start]),q=[p.start];for(let i=0;i<q.length;i++)for(const n of adj[q[i]]??[])if(!seen.has(n)){seen.add(n);q.push(n);}if(seen.size!==count)errors.push('Disconnected maze');
 }
 if(p.kind==='reveal'&&JSON.stringify(p.mask)!==JSON.stringify(p.symbols.map(row=>row.map(s=>Number(s)%2===0))))errors.push('Reveal mask mismatch');
 if(p.kind==='route'&&(p.clues.length!==5||p.routes.some(r=>r.code.length!==5)))errors.push('Five clues and complete gate codes required');
 return {valid:errors.length===0,errors,solutions:solutions.length};
}
export const registry=Object.fromEntries((['maze','route','reveal','word-search','cipher'] as const).map(id=>[id,{id,version:'1.0.0',generate:(c:Config,s:string)=>generate(id,c,s),solve,validate,renderBlueprint:(p:Puzzle)=>({bounds:{width:560,height:480},protectedGeometry:p})}])) as Record<Mechanic,PuzzleGenerator>;
