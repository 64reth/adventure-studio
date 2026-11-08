import { AdventureSchema, type Adventure, type StorageAdapter } from '../core/index';
export class BrowserStorage implements StorageAdapter {
 private key='adventure-studio:v1';
 async list(){const raw=localStorage.getItem(this.key);if(!raw)return [];return AdventureSchema.array().parse(JSON.parse(raw));}
 async get(id:string){return (await this.list()).find(a=>a.id===id)??null;}
 async save(a:Adventure){const all=await this.list();const parsed=AdventureSchema.parse(a);const previous=all.find(x=>x.id===a.id);if(previous&&a.version<previous.version)throw new Error('A newer revision exists; reload before saving.');localStorage.setItem(this.key,JSON.stringify([...all.filter(x=>x.id!==a.id),parsed]));}
 async remove(id:string){localStorage.setItem(this.key,JSON.stringify((await this.list()).filter(a=>a.id!==id)));}
}
