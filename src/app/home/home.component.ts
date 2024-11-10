import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
 
  public signUpModel :any;
  public signInModel :any;
  logoFlag:boolean = true;

  ngOnInit(){
    this.signUpModel = document.getElementById("signUp");
    this.signInModel = document.getElementById("signIn");
  }

  signUp(){
    if(this.signUpModel != null){
      this.signUpModel.style.display = "block";
    }
  }

  signIn(){
    if(this.signInModel != null){
      this.signInModel.style.display = "block";
    }
  }

  closeSignUp(){
    if(this.signUpModel != null){
      this.signUpModel.style.display = "none";
    }
  }

  closeSignIn(){
    if(this.signInModel != null){
      this.signInModel.style.display = "none";
    }
  }

  openMenu(){
    this.logoFlag = !this.logoFlag;
  }
}
