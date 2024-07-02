import { Usuario } from "./usuario";

export class Comentario {
    id?: number;
    user?: Usuario;
    usuario?: Usuario;
    usuario_id: any;
    video_id: any;
    respuesta_id?: any;
    mensaje: any;
    created_at:any;

    respuestas?: Comentario[] = [];
    mostrarRespuestas: boolean = false; 


    constructor(user: Usuario) {
        this.user = user;
        this.usuario = user;
    }
}