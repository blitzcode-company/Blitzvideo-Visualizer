import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home.component';
import { RegistroComponent } from './componentes/registro/registro.component';
import { LoginComponent } from './componentes/login/login.component';
import { VerVideoComponent } from './componentes/ver-video/ver-video.component';
import { EditarUsuarioComponent } from './componentes/editar-usuario/editar-usuario.component';
import { ResultadoDeBusquedaComponent } from './componentes/resultado-de-busqueda/resultado-de-busqueda.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'registro', component: RegistroComponent},
  {path: 'login', component: LoginComponent},
  {path: 'video/:id', component: VerVideoComponent},
  {path: 'editarUsuario', component: EditarUsuarioComponent},
  { path: 'buscar/:nombre', component: ResultadoDeBusquedaComponent }, 
  { path: '**', redirectTo: '', pathMatch: 'full' }  

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
