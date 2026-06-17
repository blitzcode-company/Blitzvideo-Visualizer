import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../servicios/auth.service';
import { TransaccionService } from '../../../servicios/transaccion.service';
import { UsuarioGlobalService } from '../../../servicios/usuario-global.service';
import { Title } from '@angular/platform-browser';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, catchError, finalize, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmarBajaModalComponent } from '../../modales/confirmar-baja-modal/confirmar-baja-modal.component';

@Component({
  selector: 'app-seleccion-pago',
  templateUrl: './seleccion-pago.component.html',
  styleUrls: ['./seleccion-pago.component.css']
})
export class SeleccionPagoComponent implements OnInit, OnDestroy {
  selectedPaymentMethod: 'paypal' | 'stripe' = 'paypal';
  usuario: any;
  planUsuario: any;
  userId: any;
  sidebarCollapsed$!: Observable<boolean>;
  isLoading = true;
  hasError = false;
  errorMessage = '';
  
  private destroy$ = new Subject<void>();
  private refreshInterval: any;

  constructor(
    private authService: AuthService,
    private transaccionService: TransaccionService,
    private usuarioGlobalService: UsuarioGlobalService,
    private titleService: Title,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.sidebarCollapsed$ = this.usuarioGlobalService.sidebarCollapsed$;
    this.titleService.setTitle('Pagos - BlitzVideo');
    this.cargarDatosIniciales();
    this.setupAutoRefresh();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private setupAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      if (this.planUsuario && this.userId) {
        this.verificarEstadoSuscripcion();
      }
    }, 5 * 60 * 1000);
  }

  private verificarEstadoSuscripcion(): void {
    this.transaccionService.listarPlan(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.transaccion) {
            const estadoActual = response.transaccion.estado;
            if (estadoActual !== this.planUsuario.estado) {
              this.planUsuario = { ...this.planUsuario, ...response.transaccion };
              this.mostrarNotificacion('El estado de tu suscripción ha cambiado', 'info');
            }
          }
        },
        error: (error) => console.error('Error verificando estado:', error)
      });
  }

  cargarDatosIniciales(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.authService.mostrarUserLogueado()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error al obtener usuario:', error);
          this.hasError = true;
          this.errorMessage = 'Error al cargar tus datos. Por favor, recarga la página.';
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(user => {
        if (user) {
          this.usuario = user;
          this.userId = user.id;
          
          if (user.premium === 1) {
            this.cargarPlanUsuario();
          } else {
            this.planUsuario = null;
          }
        }
      });
  }

  cargarPlanUsuario(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.transaccionService.listarPlan(this.userId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error al listar el plan:', error);
          this.hasError = true;
          this.errorMessage = 'Error al cargar tu suscripción. Intenta nuevamente.';
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(response => {
        if (response && response.success) {
          this.planUsuario = response.transaccion;
          this.verificarSuscripcionProximaExpiracion();
        } else if (response && !response.success) {
          this.hasError = true;
          this.errorMessage = response.message || 'No se pudo cargar tu suscripción';
        }
      });
  }

  private verificarSuscripcionProximaExpiracion(): void {
    if (this.planUsuario?.fecha_expiracion) {
      const fechaExpiracion = new Date(this.planUsuario.fecha_expiracion);
      const ahora = new Date();
      const diasRestantes = Math.ceil((fechaExpiracion.getTime() - ahora.getTime()) / (1000 * 3600 * 24));
      
      if (diasRestantes <= 7 && diasRestantes > 0) {
        this.mostrarNotificacion(
          `Tu suscripción expirará en ${diasRestantes} días. ¡Renueva para no perder los beneficios!`,
          'warning'
        );
      } else if (diasRestantes <= 0) {
        this.mostrarNotificacion('Tu suscripción ha expirado. Renueva para seguir disfrutando de Premium.', 'warning');
      }
    }
  }

  cambiarMetodoPago(metodo: 'paypal' | 'stripe'): void {
    this.selectedPaymentMethod = metodo;
    this.hasError = false;
  }

  onPagoExitoso(): void {
    this.mostrarNotificacion('¡Pago exitoso! Ahora disfrutas de BlitzVideo Premium', 'success');
    this.cargarPlanUsuario(); 
  }

  onPaymentError(error: any): void {
    this.hasError = true;
    this.errorMessage = error?.message || 'Error al procesar el pago. Intenta nuevamente.';
    this.mostrarNotificacion(this.errorMessage, 'error');
  }

  confirmarBajaPlan(): void {
    const dialogRef = this.dialog.open(ConfirmarBajaModalComponent, {
      width: '400px',
      disableClose: false,
      data: {
        planNombre: this.planUsuario?.plan || 'Premium',
        fechaExpiracion: this.planUsuario?.fecha_expiracion
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result === true) {
          this.bajaPlan();
        }
      });
  }

  private bajaPlan(): void {
    if (!this.planUsuario) {
      this.mostrarNotificacion('No hay un plan activo para dar de baja', 'error');
      return;
    }
  
    const subscriptionId = this.planUsuario.suscripcion_id;
    const metodoPago = this.planUsuario.metodo_de_pago;
    
    if (!subscriptionId) {
      this.mostrarNotificacion('ID de suscripción no encontrado', 'error');
      return;
    }

    this.isLoading = true;
    
    let cancelarSuscripcion$;
    
    if (metodoPago === 'paypal') {
      cancelarSuscripcion$ = this.transaccionService.cancelarSuscripcionPayPal(subscriptionId);
    } else if (metodoPago === 'stripe') {
      cancelarSuscripcion$ = this.transaccionService.cancelarSuscripcionStripe(subscriptionId);
    } else {
      this.mostrarNotificacion('Método de pago no reconocido', 'error');
      this.isLoading = false;
      return;
    }

    cancelarSuscripcion$
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error al cancelar suscripción:', error);
          this.mostrarNotificacion(
            error?.error?.message || `Error al cancelar la suscripción de ${metodoPago}`,
            'error'
          );
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(response => {
        if (response && response.success) {
          this.mostrarNotificacion(response.message || 'Suscripción cancelada exitosamente', 'success');
          this.eliminarPlan();
        } else if (response && !response.success) {
          this.mostrarNotificacion(response.message || 'Error al cancelar la suscripción', 'error');
        }
      });
  }
  
  private eliminarPlan(): void {
    if (!this.userId) return;
    
    this.transaccionService.bajaPlan(this.userId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error al eliminar plan:', error);
          this.mostrarNotificacion('Error al eliminar el plan', 'error');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response && response.success) {
          this.mostrarNotificacion('Plan eliminado exitosamente', 'success');
          this.planUsuario = null;
          if (this.usuario) {
            this.usuario.premium = 0;
          }
        } else if (response && !response.success) {
          this.mostrarNotificacion('Error al eliminar el plan: ' + response.message, 'error');
        }
      });
  }

  getTiempoRestante(): string {
    if (!this.planUsuario?.fecha_expiracion) return '';
    
    const expiracion = new Date(this.planUsuario.fecha_expiracion);
    const ahora = new Date();
    const diffDias = Math.ceil((expiracion.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDias <= 0) return 'Expirado';
    if (diffDias === 1) return '1 día restante';
    if (diffDias <= 7) return `${diffDias} días restantes (¡renueva pronto!)`;
    return `${diffDias} días restantes`;
  }

  isExpiringSoon(): boolean {
    const tiempoRestante = this.getTiempoRestante();
    if (!tiempoRestante || tiempoRestante === 'Expirado') return false;
    const dias = parseInt(tiempoRestante);
    return !isNaN(dias) && dias <= 7;
  }

  copiarIdSuscripcion(): void {
    if (this.planUsuario?.suscripcion_id) {
      navigator.clipboard.writeText(this.planUsuario.suscripcion_id)
        .then(() => {
          this.mostrarNotificacion('ID de suscripción copiado', 'success');
        })
        .catch(() => {
          this.mostrarNotificacion('Error al copiar el ID', 'error');
        });
    }
  }

  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info'): void {
    let panelClass = '';
    let duracion = 3000;
    
    switch (tipo) {
      case 'success':
        panelClass = 'snackbar-success';
        break;
      case 'error':
        panelClass = 'snackbar-error';
        duracion = 5000;
        break;
      case 'warning':
        panelClass = 'snackbar-warning';
        duracion = 6000;
        break;
      case 'info':
        panelClass = 'snackbar-info';
        duracion = 4000;
        break;
    }
    
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  recargarDatos(): void {
    this.cargarDatosIniciales();
  }
}