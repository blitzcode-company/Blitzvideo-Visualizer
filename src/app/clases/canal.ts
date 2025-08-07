import { Usuario } from "./usuario";

export class Canal {
    id: number;
    user_id: number;
    nombre: string;
    descripcion: string;
    user: Usuario;
    portada?: File; 
    portadaPreview?: string; 
    

    constructor(data?: any) {
        this.id = data?.id ?? 0;
        this.user_id = data?.user_id ?? 0;
        this.nombre = data?.nombre ?? '';
        this.descripcion = data?.descripcion ?? '';
        this.user_id = data?.user_id ?? '';
        this.user = new Usuario(data?.user);
      }

}
    