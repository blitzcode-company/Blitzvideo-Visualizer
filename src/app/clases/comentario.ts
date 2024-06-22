import { Usuario } from "./usuario";

export class Comentario {
    id?: number;
    usuario?: Usuario;
    usuario_id: any;
    video_id: any;
    respuesta_id: any;
    mensaje: any;
    respuestas_hijas?: Comentario[];

    constructor(usuario: Usuario) {
        this.usuario = usuario;
    }
}