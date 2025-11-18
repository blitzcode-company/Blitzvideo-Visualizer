import { Usuario } from "./usuario";

export class Comentario {
  id?: number;
  user?: Usuario;
  usuario?: Usuario;
  usuario_id!: number;
  video_id!: number;
  respuesta_id?: number;
  mensaje!: string;
  created_at!: any;
  bloqueado!: boolean;
  respuestas?: Comentario[];
  mostrarRespuestas?: boolean;
  likedByUser?: boolean;
  puedeBorrar?: boolean;
  meGustaId?: number | null;
  contadorDeLikes?: number | null;

    constructor(data?: Partial<Comentario>) {
        if (data) {
            Object.assign(this, data); // copia todos los campos del backend
        }
    }
}
