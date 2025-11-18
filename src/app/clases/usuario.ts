import moment, { Moment } from "moment";

export class Usuario {
    id: number;
    name: string;
    email: string;
    fecha_de_nacimiento: Moment;
    premium: number;
    bloqueado: number;
    foto: string;
    deleted_at: Moment | null;
    created_at: Moment;
    updated_at: Moment;

    constructor(data?: any) {
        this.id = data?.id ?? 0;
        this.name = data?.nombre ?? '';
        this.email = data?.email ?? '';
        this.fecha_de_nacimiento = data?.fecha_de_nacimiento 
            ? moment(data.fecha_de_nacimiento) 
            : moment();
        this.premium = data?.premium ?? 0;
        this.bloqueado = data?.bloqueado ?? 0;
        this.foto = data?.foto ?? '';
        this.deleted_at = data?.deleted_at ? moment(data.deleted_at) : null;
        this.created_at = data?.created_at ? moment(data.created_at) : moment();
        this.updated_at = data?.updated_at ? moment(data.updated_at) : moment();
    }
}
