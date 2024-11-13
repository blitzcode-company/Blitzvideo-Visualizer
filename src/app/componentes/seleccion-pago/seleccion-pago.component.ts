import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { TransaccionService } from '../../servicios/transaccion.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-seleccion-pago',
  templateUrl: './seleccion-pago.component.html',
  styleUrl: './seleccion-pago.component.css'
})
export class SeleccionPagoComponent implements OnInit {
  selectedPaymentMethod: string = 'paypal'; 
  usuario:any;
  planUsuario: any;
  userId:any;

  constructor(
    private authService: AuthService,
    private transaccionService: TransaccionService,
    private titleService: Title,
) {}

  cambiarMetodoPago(metodo: string) {
    this.selectedPaymentMethod = metodo;
  }
  ngOnInit() {
    this.obtenerUsuario(); 
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
    if (!this.planUsuario) {
      console.error('No hay un plan activo para dar de baja.');
      return;
    }
  
    const subscriptionId = this.planUsuario.suscripcion_id; 
    const metodoPago = this.planUsuario.metodo_de_pago; 
  
    if (metodoPago === 'paypal') {
      this.transaccionService.cancelarSuscripcionPayPal(subscriptionId).subscribe(
        response => {
          if (response.success) {
            alert(response.message); 
            this.eliminarPlan(this.userId); 
          } else {
            alert(response.message);
          }
        },
        error => {
          alert('Error al cancelar la suscripción de PayPal: ' + error.message);
        }
      );
    } else if (metodoPago === 'stripe') {
      this.transaccionService.cancelarSuscripcionStripe(subscriptionId).subscribe(
        response => {
          if (response.success) {
            alert(response.message);
            this.eliminarPlan(this.userId); 
          } else {
            alert(response.message);
          }
        },
        error => {
          alert('Error al cancelar la suscripción de Stripe: ' + error.message);
        }
      );
    } else {
      console.error('Método de pago no reconocido.');
    }
  }
  
  eliminarPlan(userId: number): void {
    this.transaccionService.bajaPlan(userId).subscribe(
      response => {
        if (response.success) {
          alert('Plan eliminado exitosamente.');
          this.planUsuario = null; 
        } else {
          alert('Error al eliminar el plan: ' + response.message);
        }
      },
      error => {
        alert('Error al eliminar el plan: ' + error.message);
      }
    );
  }
}
