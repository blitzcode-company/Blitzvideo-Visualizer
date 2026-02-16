import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home/home.component';
import { VerVideoComponent } from './componentes/componentes-de-video/ver-video/ver-video.component';
import { EditarUsuarioComponent } from './componentes/componentes-usuario/editar-usuario/editar-usuario.component';
import { ResultadoDeBusquedaComponent } from './componentes/home/resultado-de-busqueda/resultado-de-busqueda.component';
import { VerCanalComponent } from './componentes/componentes-de-canal/ver-canal/ver-canal.component';
import { VideosDelCanalComponent } from './componentes/componentes-de-canal/videos-del-canal/videos-del-canal.component';
import { NoEncontradoComponent } from './componentes/home/no-encontrado/no-encontrado.component';
import { ListaDeReproduccionComponent } from './componentes/componentes-de-playlist/lista-de-reproduccion/lista-de-reproduccion.component';
import { ContenidoListaDeReproduccionComponent } from './componentes/componentes-de-playlist/contenido-lista-de-reproduccion/contenido-lista-de-reproduccion.component';
import { PagosComponent } from './componentes/componentes-de-pago/pagos/pagos.component';
import { ConfiguracionDePerfilComponent } from './componentes/componentes-usuario/configuracion-de-perfil/configuracion-de-perfil.component';
import { SuscripcionPaypalComponent } from './componentes/componentes-de-pago/suscripcion-paypal/suscripcion-paypal.component';
import { SeleccionPagoComponent } from './componentes/componentes-usuario/seleccion-pago/seleccion-pago.component';
import { autenticacionGuard } from './guards/autenticacion.guard';
import { VerStreamComponent } from './componentes/componentes-de-stream/ver-stream/ver-stream.component';
import { ConfiguracionStreamComponent } from './componentes/componentes-usuario/configuracion-stream/configuracion-stream.component';
import { HistorialComponent } from './componentes/componentes-usuario/historial/historial.component';
import { TendenciasComponent } from './componentes/home/tendencias/tendencias.component';
import { VideosDeEtiquetaComponent } from './componentes/home/videos-de-etiqueta/videos-de-etiqueta.component';
import { InfoCanalComponent } from './componentes/componentes-de-canal/info-canal/info-canal.component';
import { PlaylistDelCanalComponent } from './componentes/componentes-de-canal/playlist-del-canal/playlist-del-canal.component';
import { MasVistosComponent } from './componentes/home/mas-vistos/mas-vistos.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'video/:id', component: VerVideoComponent, },
  {path: 'video/:id/playlist/:playlistId', component: VerVideoComponent, },
  {path: 'editarUsuario', component: EditarUsuarioComponent, canActivate: [autenticacionGuard]},
  { path: 'buscar', component: ResultadoDeBusquedaComponent}, 
  { path: 'canal/:id', component: VerCanalComponent},
  { path: 'canal/:id/videos', component: VideosDelCanalComponent},
  {path: 'canal/:id/sobre', component: InfoCanalComponent},
  {path: 'canal/:id/playlists', component: PlaylistDelCanalComponent},
  { path: 'playlists', component: ListaDeReproduccionComponent, canActivate: [autenticacionGuard]},
  { path: 'playlists/:id', component: ContenidoListaDeReproduccionComponent},
  {path: 'ajustes/pagos', component: SeleccionPagoComponent, canActivate: [autenticacionGuard]},
  {path: 'ajustes/perfil', component: ConfiguracionDePerfilComponent, canActivate: [autenticacionGuard]},
  {path: 'ajustes/streams', component: ConfiguracionStreamComponent, canActivate: [autenticacionGuard]},
  {path: 'historial', component: HistorialComponent, canActivate: [autenticacionGuard]},
  {path: 'explorar/tendencias', component: TendenciasComponent},
  {path: 'explorar/populares', component: MasVistosComponent},
  {path: 'stream/:id', component: VerStreamComponent},
  {path: 'etiqueta/:id', component: VideosDeEtiquetaComponent},
  { path: '**', component: NoEncontradoComponent }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
