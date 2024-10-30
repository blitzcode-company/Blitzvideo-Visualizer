import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { TransaccionService } from '../../servicios/transaccion.service';
import { MatDialog } from '@angular/material/dialog';
import { PagosService } from '../../servicios/pagos.service';
import { AuthService } from '../../servicios/auth.service';
import { GraciasModalComponent } from '../gracias-modal/gracias-modal.component'; 

@Component({
  selector: 'app-suscripcion-paypal',
  templateUrl: './suscripcion-paypal.component.html',
  styleUrls: ['./suscripcion-paypal.component.css']
})
export class SuscripcionPaypalComponent implements AfterViewInit {
  userId: any;
  usuario: any;
  planUsuario: any;

  constructor(
    private pagosApi: PagosService, 
    private authService: AuthService,
    private transaccionService: TransaccionService,
    private dialog: MatDialog 
  ) {}

  @ViewChild('paypalButtonContainer', { static: true }) paypalButtonContainer!: ElementRef;

  ngAfterViewInit(): void {
    this.obtenerUsuario();
    this.cargarScriptPaypal().then(() => {
      if (typeof paypal !== 'undefined') {
        paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: (data: any, actions: any) => {
            return actions.subscription.create({
              plan_id: 'P-77C972192U696212FM4DXGNA'
            });
          },
          onApprove: (data: any) => {
            this.registrarPlan(data.subscriptionID);
          }
        }).render(this.paypalButtonContainer.nativeElement);
      } else {
        console.error("PayPal SDK no se cargó correctamente.");
      }
    });
  }

  private cargarScriptPaypal(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=Ab2GdNz6ABzc3H6S95-UpP6mwERCHvTGZJg1-XEdk9qAuAHos5kaf3Sl4KcVx-lx17HknE6Z-mFhHUsW&vault=true&intent=subscription';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
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

  registrarPlan(subscriptionId: string) {
    this.transaccionService.registrarPlan(this.userId, 'premium', 'paypal', subscriptionId)
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

  
  mostrarModalGracias() {
    this.dialog.open(GraciasModalComponent);
  }
}
