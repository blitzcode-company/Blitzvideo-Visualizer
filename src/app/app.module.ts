import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { ChunkPipe } from './pipes/chunk.pipe'; 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './componentes/home/home.component';
import { HeaderComponent } from './componentes/header/header.component';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { VerVideoComponent } from './componentes/ver-video/ver-video.component';
import { EditarUsuarioComponent } from './componentes/editar-usuario/editar-usuario.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ComentariosComponent } from './componentes/comentarios/comentarios.component';
import { UsuarioRequeridoComponent } from './Modales/usuario-requerido/usuario-requerido.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ResultadoDeBusquedaComponent } from './componentes/resultado-de-busqueda/resultado-de-busqueda.component'; 
import { ComentariosService } from './servicios/comentarios.service';
import { ContenidoDeComentariosComponent } from './componentes/contenido-de-comentarios/contenido-de-comentarios.component';
import { VerCanalComponent } from './componentes/ver-canal/ver-canal.component';
import { VideosDelCanalComponent } from './componentes/videos-del-canal/videos-del-canal.component';
import {VgCoreModule} from '@videogular/ngx-videogular/core';
import {VgControlsModule} from '@videogular/ngx-videogular/controls';
import {VgOverlayPlayModule} from '@videogular/ngx-videogular/overlay-play';
import {VgBufferingModule} from '@videogular/ngx-videogular/buffering';
import { ReproductorVideoComponent } from './componentes/reproductor-video/reproductor-video.component'
import { RouterModule } from '@angular/router';
import { NoEncontradoComponent } from './componentes/no-encontrado/no-encontrado.component';
import { ListaDeReproduccionComponent } from './componentes/lista-de-reproduccion/lista-de-reproduccion.component';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatSelectModule } from '@angular/material/select';
import { MatOption } from '@angular/material/select';
import { ContenidoListaDeReproduccionComponent } from './componentes/contenido-lista-de-reproduccion/contenido-lista-de-reproduccion.component';
import { ConfirmacionDesuscribirModalComponent } from './componentes/confirmacion-desuscribir-modal/confirmacion-desuscribir-modal.component';
import { AgregarListaComponent } from './componentes/agregar-lista/agregar-lista.component';
import { CrearListaComponent } from './componentes/crear-lista/crear-lista.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ModalEditarlistaComponent } from './componentes/modal-editarlista/modal-editarlista.component';
import { PagosComponent } from './componentes/pagos/pagos.component';
import { ConfiguracionDePerfilComponent } from './componentes/configuracion-de-perfil/configuracion-de-perfil.component';
import { GraciasModalComponent } from './componentes/gracias-modal/gracias-modal.component';



@NgModule({
  declarations: [
    AppComponent,
    ChunkPipe,
    HomeComponent,
    HeaderComponent,
    VerVideoComponent,
    EditarUsuarioComponent,
    ComentariosComponent,
    UsuarioRequeridoComponent,
    ResultadoDeBusquedaComponent,
    ContenidoDeComentariosComponent,
    VideosDelCanalComponent,
    VerCanalComponent,
    ReproductorVideoComponent,
    NoEncontradoComponent,
    ListaDeReproduccionComponent,
    ContenidoListaDeReproduccionComponent,
    ConfirmacionDesuscribirModalComponent,
    AgregarListaComponent,
    CrearListaComponent,
    ModalEditarlistaComponent,
    PagosComponent,
    ConfiguracionDePerfilComponent,
    GraciasModalComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: 'video/:id', component: VerVideoComponent },
    ]),
    NgbModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOption,
    MatSnackBarModule


  ],
  exports: [
    VerVideoComponent,
    ContenidoDeComentariosComponent,
    ComentariosComponent
  ],
  providers: [
    CookieService, 
    provideAnimationsAsync(),
    ComentariosService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
