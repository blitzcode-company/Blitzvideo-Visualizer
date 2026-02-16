import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../servicios/auth.service';
import { TransaccionService } from '../../../servicios/transaccion.service';
import { UsuarioGlobalService } from '../../../servicios/usuario-global.service';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmarBajaModalComponent } from '../../modales/confirmar-baja-modal/confirmar-baja-modal.component';

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
  sidebarCollapsed$!: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private transaccionService: TransaccionService,
    private usuarioGlobalService: UsuarioGlobalService,
    private titleService: Title,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
) {}

  cambiarMetodoPago(metodo: string) {
    this.selectedPaymentMethod = metodo;
  }
  ngOnInit() {
    this.sidebarCollapsed$ = this.usuarioGlobalService.sidebarCollapsed$;
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

  confirmarBajaPlan(): void {
    const dialogRef = this.dialog.open(ConfirmarBajaModalComponent, {
      width: '400px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.bajaPlan();
      }
    });
  }

  bajaPlan(): void {
    if (!this.planUsuario) {
      this.snackBar.open('No hay un plan activo para dar de baja', 'Cerrar', { 
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }
  
    const subscriptionId = this.planUsuario.suscripcion_id; 
    const metodoPago = this.planUsuario.metodo_de_pago; 
    
    console.log('Plan Usuario:', this.planUsuario);
    console.log('Subscription ID:', subscriptionId);
    console.log('Método de Pago:', metodoPago);
  
    if (metodoPago === 'paypal') {
      this.transaccionService.cancelarSuscripcionPayPal(subscriptionId).subscribe(
        response => {
          console.log('Respuesta PayPal:', response);
          if (response.success) {
            this.snackBar.open(response.message, 'Cerrar', { 
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.eliminarPlan(this.userId); 
          } else {
            this.snackBar.open(response.message, 'Cerrar', { 
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        },
        error => {
          console.error('Error PayPal:', error);
          this.snackBar.open('Error al cancelar la suscripción de PayPal', 'Cerrar', { 
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      );
    } else if (metodoPago === 'stripe') {
      this.transaccionService.cancelarSuscripcionStripe(subscriptionId).subscribe(
        response => {
          console.log('Respuesta Stripe:', response);
          if (response.success) {
            this.snackBar.open(response.message, 'Cerrar', { 
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.eliminarPlan(this.userId); 
          } else {
            this.snackBar.open(response.message, 'Cerrar', { 
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        },
        error => {
          console.error('Error Stripe:', error);
          this.snackBar.open('Error al cancelar la suscripción de Stripe', 'Cerrar', { 
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      );
    } else {
      this.snackBar.open('Método de pago no reconocido', 'Cerrar', { 
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }
  
  eliminarPlan(userId: number): void {
    this.transaccionService.bajaPlan(userId).subscribe(
      response => {
        if (response.success) {
          this.snackBar.open('Plan eliminado exitosamente', 'Cerrar', { 
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.planUsuario = null; 
        } else {
          this.snackBar.open('Error al eliminar el plan: ' + response.message, 'Cerrar', { 
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      },
      error => {
        this.snackBar.open('Error al eliminar el plan', 'Cerrar', { 
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    );
  }
}
