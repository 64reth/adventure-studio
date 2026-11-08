import {test,expect} from 'vitest';
import {createAdventure,migrate} from '../packages/core/index';
import {layout,gutter} from '../packages/print/index';
import {FileStorage} from '../packages/storage/file';
import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
test('versioned adventure CRUD round trip',async()=>{const dir=await mkdtemp(join(tmpdir(),'adventure-'));try{const store=new FileStorage(dir),a=createAdventure('Test');await store.save(a);expect(await store.get(a.id)).toEqual(a);expect(await store.list()).toHaveLength(1);await store.remove(a.id);expect(await store.get(a.id)).toBeNull();}finally{await rm(dir,{recursive:true});}});
test('rejects unsupported schema versions',()=>expect(()=>migrate({schemaVersion:2})).toThrow());
test('mirrors bleed at outside edge and honours all gutter thresholds',()=>{expect([150,151,301,501,701].map(gutter)).toEqual([.375,.5,.625,.75,.875]);expect(layout('no-bleed',1,5).width).toBe(8.5);expect(layout('kdp-bleed',1,5).trim.x).toBe(0);expect(layout('kdp-bleed',2,5).trim.x).toBe(.125);expect(layout('kdp-bleed',1,501).safe.x).toBe(.75);expect(()=>gutter(0)).toThrow();});
