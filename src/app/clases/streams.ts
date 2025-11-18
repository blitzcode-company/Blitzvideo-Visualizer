import { Canal } from "./canal"
import { Usuario } from "./usuario"


export class Streams {

id: number;
titulo: string;
descripcion: string;
miniatura: string;
activo: number;
canal_id: number;
created_at: string;
updated_at: string;
canal: Canal;
    user: Usuario;
    url_hls: string;
 error?: {
        code: number;
        mensaje: string;
   };

    constructor(data?: any) {
        this.id = data?.id ?? 0;
        this.titulo = data?.titulo ?? '';
        this.descripcion = data?.descripcion ?? '';
        this.miniatura = data?.miniatura ?? '';
        this.activo = data?.activo ?? 0;
        this.canal_id = data?.canal_id ?? 0;
        this.created_at = data?.created_at ?? '';
        this.updated_at = data?.updated_at ?? '';
        this.canal = new Canal(data?.canal)
        this.user = new Usuario(data?.user)
        this.url_hls = data?.url_hls ?? '';
    }



}
