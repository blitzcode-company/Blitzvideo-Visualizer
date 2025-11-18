import { Canal } from "./canal";

export interface Etiqueta {
  id: number;
  nombre: string;
  pivot: {
    video_id: number;
    etiqueta_id: number;
  };
}

export class Videos {
  id: number;
  canal_id: number;
  titulo: string;
  descripcion: string;
  miniatura: string;
  duracion: number;
  bloqueado: number;
  acceso: string;
  link: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  puntuacion_1: number;
  puntuacion_2: number;
  puntuacion_3: number;
  puntuacion_4: number;
  puntuacion_5: number;
  visitas_count: number;
  promedio_puntuaciones: number;
  canal: Canal;
  duracionFormateada?: string; 

  etiquetas: Etiqueta[];
  error?: {
    code: number;
    mensaje: string;
  };
  constructor(data: Partial<Videos> = {}) {
    this.id = data.id ?? 0;
    this.canal_id = data.canal_id ?? 0;
    this.titulo = data.titulo ?? '';
    this.descripcion = data.descripcion ?? '';
    this.miniatura = data.miniatura ?? '';
    this.duracion = data.duracion ?? 0;
    this.bloqueado = data.bloqueado ?? 0;
    this.acceso = data.acceso ?? 'publico';
    this.link = data.link ?? '';
    this.created_at = data.created_at ?? '';
    this.updated_at = data.updated_at ?? '';
    this.deleted_at = data.deleted_at ?? null;
    this.puntuacion_1 = data.puntuacion_1 ?? 0;
    this.puntuacion_2 = data.puntuacion_2 ?? 0;
    this.puntuacion_3 = data.puntuacion_3 ?? 0;
    this.puntuacion_4 = data.puntuacion_4 ?? 0;
    this.puntuacion_5 = data.puntuacion_5 ?? 0;
    this.visitas_count = data.visitas_count ?? 0;
    this.promedio_puntuaciones = data.promedio_puntuaciones ?? 0;
    this.canal = new Canal(data.canal);
    this.etiquetas = Array.isArray(data.etiquetas)
  ? data.etiquetas.map(et => ({ ...et }))
  : [];
  }
   [key: string]: any; 
}
