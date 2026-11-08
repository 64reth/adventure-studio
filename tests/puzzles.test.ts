import {test,expect} from 'vitest';import {registry,solve,validate,scanWords,type Maze,type WordSearch,type Reveal,type Cipher} from '../packages/puzzles/index';
for(const engine of Object.values(registry)){
 test(`${engine.id}: deterministic, independently solved across 30 seeds`,()=>{for(let i=0;i<30;i++){const p=engine.generate({},'seed-'+i);expect(engine.generate({},'seed-'+i)).toEqual(p);expect(validate(p,solve(p)[0])).toEqual({valid:true,errors:[],solutions:1});}expect(engine.generate({},'first')).not.toEqual(engine.generate({},'second'));});
 test(`${engine.id}: rejects invalid config`,()=>{expect(()=>engine.generate({size:0},'seed')).toThrow();expect(()=>engine.generate({},' ')).toThrow();});
}
test('maze has no disconnected cells or false shortcuts',()=>{const p=registry.maze.generate({},'bad') as Maze;p.edges.pop();expect(validate(p).valid).toBe(false);});
test('word search detects accidental duplicate answers in all eight directions',()=>{const p=registry['word-search'].generate({words:['CAT'],size:6},'cat') as WordSearch;p.grid[0]=['C','A','T','X','X','X'];p.grid[1]=['C','A','T','X','X','X'];expect(scanWords(p).CAT.length).toBeGreaterThan(1);expect(solve(p)).toEqual([]);});
test('reveal rejects corrupted mask and symbols',()=>{const p=registry.reveal.generate({},'x') as Reveal;p.symbols[0][0]='2';expect(validate(p).valid).toBe(false);});
test('cipher rejects unknown tokens',()=>{const p=registry.cipher.generate({},'x') as Cipher;p.encoded[0][0]='99';expect(solve(p)).toEqual([]);});
test('answer key mismatch cannot pass',()=>expect(validate(registry.route.generate({},'x'),{answer:'wrong'}).valid).toBe(false));
