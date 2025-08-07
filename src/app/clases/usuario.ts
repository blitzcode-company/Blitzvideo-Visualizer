export class Usuario {
    id: number;
    name: string;
    email: string;
    foto: string;

    constructor(data?: any) {
        this.id = data?.id ?? 0;
        this.name = data?.nombre ?? '';
        this.foto = data?.foto ?? '';
        this.email = data?.email ?? '';
      }

}
