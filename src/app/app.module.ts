import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { ChunkPipe } from './pipes/chunk.pipe'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './componentes/home/home.component';
import { HeaderComponent } from './componentes/header/header.component';
import { CookieService } from 'ngx-cookie-service';
import { LoginComponent } from './componentes/login/login.component';
import { RegistroComponent } from './componentes/registro/registro.component';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { VerVideoComponent } from './componentes/ver-video/ver-video.component';
import { EditarUsuarioComponent } from './componentes/editar-usuario/editar-usuario.component';


@NgModule({
  declarations: [
    AppComponent,
    ChunkPipe,
    HomeComponent,
    HeaderComponent,
    LoginComponent,
    RegistroComponent,
    VerVideoComponent,
    EditarUsuarioComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgbModule

  ],
  providers: [
    provideClientHydration(), 
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
