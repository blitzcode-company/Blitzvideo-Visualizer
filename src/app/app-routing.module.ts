import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home.component';
import { VerVideoComponent } from './componentes/ver-video/ver-video.component';
import { EditarUsuarioComponent } from './componentes/editar-usuario/editar-usuario.component';
import { ResultadoDeBusquedaComponent } from './componentes/resultado-de-busqueda/resultado-de-busqueda.component';
import { VerCanalComponent } from './componentes/ver-canal/ver-canal.component';
import { VideosDelCanalComponent } from './componentes/videos-del-canal/videos-del-canal.component';
import { NoEncontradoComponent } from './componentes/no-encontrado/no-encontrado.component';
import { ListaDeReproduccionComponent } from './componentes/lista-de-reproduccion/lista-de-reproduccion.component';
import { ContenidoListaDeReproduccionComponent } from './componentes/contenido-lista-de-reproduccion/contenido-lista-de-reproduccion.component';
import { PagosComponent } from './componentes/pagos/pagos.component';
import { ConfiguracionDePerfilComponent } from './componentes/configuracion-de-perfil/configuracion-de-perfil.component';
import { SuscripcionPaypalComponent } from './componentes/suscripcion-paypal/suscripcion-paypal.component';
import { SeleccionPagoComponent } from './componentes/seleccion-pago/seleccion-pago.component';
import { autenticacionGuard } from './guards/autenticacion.guard';
import { VerStreamComponent } from './componentes/ver-stream/ver-stream.component';
import { ConfiguracionStreamComponent } from './componentes/configuracion-stream/configuracion-stream.component';
import { HistorialComponent } from './componentes/historial/historial.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'video/:id', component: VerVideoComponent, },
  {path: 'video/:id/playlist/:playlistId', component: VerVideoComponent, },
  {path: 'editarUsuario', component: EditarUsuarioComponent, canActivate: [autenticacionGuard]},
  { path: 'buscar', component: ResultadoDeBusquedaComponent}, 
  { path: 'canal/:id', component: VerCanalComponent},
  { path: 'canal/:id/videos', component: VideosDelCanalComponent},
  { path: 'playlists', component: ListaDeReproduccionComponent, canActivate: [autenticacionGuard]},
  { path: 'playlists/:id', component: ContenidoListaDeReproduccionComponent, canActivate: [autenticacionGuard]},
  {path: 'ajustes/pagos', component: SeleccionPagoComponent, canActivate: [autenticacionGuard]},
  {path: 'ajustes/perfil', component: ConfiguracionDePerfilComponent, canActivate: [autenticacionGuard]},
  {path: 'ajustes/streams', component: ConfiguracionStreamComponent, canActivate: [autenticacionGuard]},
  {path: 'historial', component: HistorialComponent, canActivate: [autenticacionGuard]},
  {path: 'stream/:id', component: VerStreamComponent},
  
  { path: '**', component: NoEncontradoComponent }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
