import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MainComponent} from "./components/main/main.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {ApiService} from "./services/api.service";
import {ReactiveFormsModule} from "@angular/forms";
import {StoreService} from "./services/store.service";
import {InterceptorInterceptor} from "./interceptors/interceptor.interceptor";
import {AuthGuard} from "./guards/auth.guard";
import {UserResolver} from "./resolver/user.resolver";
import {MainGuard} from "./guards/main.guard";
import {ChatModule} from "./components/chat/chat.module";

@NgModule({
  declarations: [
    AppComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ChatModule
  ],
  providers: [ApiService, StoreService, InterceptorInterceptor, AuthGuard, MainGuard, UserResolver,
    {provide: HTTP_INTERCEPTORS, useClass: InterceptorInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
