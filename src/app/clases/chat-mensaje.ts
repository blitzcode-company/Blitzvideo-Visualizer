export class ChatMensaje {
  id: number;
  user_name: string;
  user_photo: string | null;
  message: string;
  created_at: string;

  constructor(data: any) {
    console.log('Construyendo ChatMensaje con datos:', JSON.stringify(data, null, 2));
    this.id = data.id || 0;
    this.user_name = data.user_name || data.user || 'Anónimo';
    this.user_photo = data.user_photo || data.photo || null;
    this.message = data.message || data.text || '';
    this.created_at = data.created_at || new Date().toISOString();
    console.log('ChatMensaje creado:', JSON.stringify(this, null, 2));
  }
  }