import { Component, OnInit } from '@angular/core';
import { PagosService } from '../../servicios/pagos.service';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { AuthService } from '../../servicios/auth.service';
import { Title } from '@angular/platform-browser';
import { GraciasModalComponent } from '../gracias-modal/gracias-modal.component'; 
import { MatDialog } from '@angular/material/dialog';
import { TransaccionService } from '../../servicios/transaccion.service';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css'] 
})
export class PagosComponent implements OnInit {

  stripe: Stripe | null = null;
  card: StripeCardElement | null = null;
  elements: StripeElements | null = null;
  userId: any;
  usuario: any;
  planUsuario: any;

  
  nombre: string = '';
  email: string = '';
  direccion = {
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  };

  constructor(private pagosApi: PagosService, 
              private authService: AuthService,
              private transaccionService: TransaccionService,
              private titleService: Title,
              private dialog: MatDialog 
          ) {}

  ngOnInit() {
    this.obtenerUsuario(); 
    this.inicializarStripe(); 
    this.titleService.setTitle('Pagos - BlitzVideo');

  }

  obtenerUsuario(): void {
    this.authService.mostrarUserLogueado().subscribe(res => {
      this.usuario = res;
      this.userId = this.usuario.id;

      if (this.usuario.premium === 1) {
        this.listarPlan(this.userId);
      }

    });
  }

  async inicializarStripe() {
    this.stripe = await loadStripe('pk_test_51Q7PphGPwkmlbJzo1CHwmGLAomHbpPzjotthLhHjFv2F0HBUeME9ahkbBzPMY6JC9ZpgHH71bidQNg1ReTpoKCuK00ak6M8ArZ');
    this.elements = this.stripe?.elements() ?? null;

    if (this.elements) {
      this.card = this.elements.create('card');
      this.card.mount('#card-element');
    }
  }

  async pagar() {
    if (!this.stripe || !this.card) return;

    const { token, error } = await this.stripe.createToken(this.card);

    if (error) {
      console.error('Error al crear el token:', error.message);
      alert('Error al procesar el pago. Intente de nuevo.');
      return; 
    }

    if (token) {
      const data = {
        stripeToken: token.id,
        nombre: this.nombre,
        email: this.email,
        direccion: this.direccion
      };

      this.pagosApi.procesarPago(token.id, this.nombre, this.email, this.direccion, this.userId)
      .subscribe({
        next: response => {
          if (response.success) {
            console.log('Pago exitoso:', response.message);
            alert('¡Pago realizado con éxito!');
            const subscriptionId = response.subscription.id;


            this.registrarPlan(subscriptionId);
            this.mostrarModalGracias();
          } else {
            console.error('Error en el pago:', response.message);
            alert('Error en el pago: ' + response.message);
          }
        },
        error: err => {
          console.error('Error en el servidor:', err);
          alert('Error en el servidor. Por favor, inténtelo más tarde.');
        }
      });
    }
  }

  registrarPlan(subscriptionId: string)  {
    this.transaccionService.registrarPlan(this.userId, 'premium', 'stripe', subscriptionId)
      .subscribe({
        next: response => {
          if (response.success) {
            console.log('Usuario actualizado a premium:', response.message);
            this.mostrarModalGracias(); 
            this.listarPlan(this.userId);

          } else {
            console.error('Error al registrar el plan:', response.message);
            alert('Error al registrar el plan: ' + response.message);
          }
        },
        error: err => {
          console.error('Error en el servidor:', err);
          alert('Error en el servidor al registrar el plan.');
        }
      });
  }


  listarPlan(userId: number): void {
    this.transaccionService.listarPlan(userId).subscribe({
      next: response => {
        if (response.success) {
          this.planUsuario = response.transaccion; 
        } else {
          console.error('Error al listar el plan:', response.message);
        }
      },
      error: err => {
        console.error('Error en el servidor al listar el plan:', err);
      }
    });
  }

  bajaPlan(): void {
    this.transaccionService.bajaPlan(this.userId).subscribe({
      next: response => {
        if (response.success) {
          this.planUsuario = null; 
          alert('Plan dado de baja exitosamente.');
        } else {
          alert('Error al dar de baja el plan: ' + response.message);
        }
      },
      error: err => {
        alert('Error en el servidor: ' + err.message);
      }
    });
  }

  mostrarModalGracias() {
    this.dialog.open(GraciasModalComponent);
  }

  
}
