// clases/notificacion.ts
export type ReferenciaTipo = 
  | 'new_video'
  | 'new_comment'
  | 'new_reply'
  | 'blocked_video'
  | 'unblocked_video'
  | 'blocked_user'
  | 'unblocked_user'
  | 'blocked_comment';

export class Notificacion {
  id!: number;
  mensaje!: string;
  referencia_id!: number;
  referencia_tipo!: ReferenciaTipo;
  fecha_creacion!: string;
  leido!: 0 | 1;

  id_video: number | null = null;
  titulo_video: string | null = null;
  miniatura_video: string | null = null;

  texto_comentario: string | null = null;
  nombre_comentador: string | null = null;
  foto_perfil_comentador: string | null = null;

  nombre_subidor?: string | null;
  foto_perfil_subidor?: string | null;

  time_ago?: string;

  constructor(data?: Partial<Notificacion>) {
    if (data) Object.assign(this, data);
  }

  // Métodos útiles
  get esNoLeida(): boolean {
    return this.leido === 0;
  }

  get autorNombre(): string {
    return this.nombre_comentador || this.nombre_subidor || 'Usuario';
  }

  get autorAvatar(): string {
    return this.foto_perfil_comentador || this.foto_perfil_subidor || 'assets/images/default-avatar.png';
  }

  get tieneVideo(): boolean {
    return !!this.id_video;
  }

  get tieneComentario(): boolean {
    return !!this.texto_comentario;
  }
}