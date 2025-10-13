import { Videos } from "./videos";


export class Playlist {
    id: number;
    user_id: number;
    nombre: string;
    acceso: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    videos: Videos[];
  
    constructor(data: Partial<Playlist> = {}) {
      this.id = data.id ?? 0;
      this.user_id = data.user_id ?? 0;
      this.nombre = data.nombre ?? '';
      this.acceso = data.acceso ?? 0;
      this.created_at = data.created_at ?? '';
      this.updated_at = data.updated_at ?? '';
      this.deleted_at = data.deleted_at ?? null;
      this.videos = (data.videos ?? []).map(video => new Videos(video));

        }
}
