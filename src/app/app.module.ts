import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserAfterLoginComponent } from './user-after-login/user-after-login.component';
import { LoadingGifComponent } from './loading-gif/loading-gif.component';
import { SafeHtmlPipePipe } from './Pipes/safe-html-pipe.pipe';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HomeComponent,
    SignUpComponent,
    SignInComponent,
    UserAfterLoginComponent,
    LoadingGifComponent,
    SafeHtmlPipePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
