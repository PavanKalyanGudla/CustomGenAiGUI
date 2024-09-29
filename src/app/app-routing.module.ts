import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { UserAfterLoginComponent } from './user-after-login/user-after-login.component';
import { HomeComponent } from './home/home.component';
import { unAuthorisedGuard } from './guards/un-authorised.guard';

const routes: Routes = [
  {path:"",component:HomeComponent},
  {path:"home",component:HomeComponent},
  {path:"userAfterLogin",component:UserAfterLoginComponent,canActivate:[unAuthorisedGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
