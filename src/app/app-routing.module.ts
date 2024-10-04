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

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'video/:id', component: VerVideoComponent},
  {path: 'editarUsuario', component: EditarUsuarioComponent},
  { path: 'buscar/:nombre', component: ResultadoDeBusquedaComponent }, 
  { path: 'canal/:id', component: VerCanalComponent},
  { path: 'canal/:id/videos', component: VideosDelCanalComponent},
  { path: 'playlists', component: ListaDeReproduccionComponent},
  { path: 'playlists/:id', component: ContenidoListaDeReproduccionComponent},

  { path: '**', component: NoEncontradoComponent }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
