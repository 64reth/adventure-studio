import {mkdir,readFile,writeFile,rename,unlink,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {AdventureSchema,type Adventure,type StorageAdapter} from '../core/index';
export class FileStorage implements StorageAdapter{
 constructor(private directory='.data/adventures'){}
 private path(id:string){if(!/^[a-f0-9-]{36}$/.test(id))throw new Error('Invalid ID');return join(this.directory,id+'.json');}
 async list(){await mkdir(this.directory,{recursive:true});const files=await readdir(this.directory);return Promise.all(files.filter(f=>f.endsWith('.json')).map(async f=>AdventureSchema.parse(JSON.parse(await readFile(join(this.directory,f),'utf8')))));}
 async get(id:string){try{return AdventureSchema.parse(JSON.parse(await readFile(this.path(id),'utf8')));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}}
 async save(a:Adventure){const parsed=AdventureSchema.parse(a);await mkdir(this.directory,{recursive:true});const path=this.path(a.id),temp=path+'.'+crypto.randomUUID()+'.tmp';await writeFile(temp,JSON.stringify(parsed,null,2));await rename(temp,path);}
 async remove(id:string){await unlink(this.path(id));}
}
