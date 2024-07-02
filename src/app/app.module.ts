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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  exports: [
    VerVideoComponent,
    ContenidoDeComentariosComponent,
    ComentariosComponent
  ],
  providers: [
    provideClientHydration(), 
    CookieService, 
    provideAnimationsAsync(),
    ComentariosService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
