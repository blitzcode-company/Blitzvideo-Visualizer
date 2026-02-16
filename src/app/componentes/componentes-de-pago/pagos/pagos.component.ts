import { Component, OnInit } from '@angular/core';
import { PagosService } from '../../../servicios/pagos.service';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { AuthService } from '../../../servicios/auth.service';
import { Title } from '@angular/platform-browser';
import { GraciasModalComponent } from '../../modales/gracias-modal/gracias-modal.component'; 
import { MatDialog } from '@angular/material/dialog';
import { TransaccionService } from '../../../servicios/transaccion.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
              private dialog: MatDialog,
              private snackBar: MatSnackBar
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
      this.snackBar.open('Error al procesar el pago. Intente de nuevo.', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
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
            this.snackBar.open('¡Pago realizado con éxito!', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            const subscriptionId = response.subscription.id;


            this.registrarPlan(subscriptionId);
            this.mostrarModalGracias();
          } else {
            console.error('Error en el pago:', response.message);
            this.snackBar.open('Error en el pago: ' + response.message, 'Cerrar', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        },
        error: err => {
          console.error('Error en el servidor:', err);
          this.snackBar.open('Error en el servidor. Por favor, inténtelo más tarde.', 'Cerrar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
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
            this.snackBar.open('Error al registrar el plan: ' + response.message, 'Cerrar', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        },
        error: err => {
          console.error('Error en el servidor:', err);
          this.snackBar.open('Error en el servidor al registrar el plan.', 'Cerrar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
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


  mostrarModalGracias() {
    this.dialog.open(GraciasModalComponent);
  }

  
}
