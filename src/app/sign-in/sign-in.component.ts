import { Component } from '@angular/core';
import { HttpService } from '../Services/http-service.service';
import { ResponseObj } from '../Model/response-obj';
import { User } from '../Model/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {

  forgotpasswordFlag : boolean= false;
  loadingFlag : boolean = false;
  email:String="";
  email1:String="";
  password:String="";
  userObj : User = new User();

  constructor(private _httpService : HttpService,
    private _router : Router){}
  
  forgotPassword(){
    this.forgotpasswordFlag = true;
  }

  getPassword(){
    if(this.email1 != null && this.email1 != undefined && this.email1 != ""){
      this._httpService.getPassword(this.email1).subscribe((data) => {
        alert(data);
        this.forgotpasswordFlag = false;
      });
    }else{
      alert("Please Enter Email");
    }
  }

  sigInPage(){
    this.forgotpasswordFlag = false;
  }

  signIn(){
    if(this.email != null && this.email != undefined && this.email != ""){
      if(this.password != null && this.password != undefined && this.password != ""){
        this.loadingFlag = true;
        this._httpService.userLogin(this.email,this.password).subscribe((data:ResponseObj)=>{
          if(data.responseCode == "200" && data.responseMsg=="SUCCESS"){
            this.email="";
            this.password="";
            this.userObj = data.responseModel;
            localStorage.setItem("userObjectData",JSON.stringify(this.userObj));
            if(null != localStorage.getItem("userObjectData")){
              this._router.navigate(["/userAfterLogin"]);
            }
          }else{
            alert("User Not Exists");
          }
          this.loadingFlag = false;
        })
      }else{
        alert("Please Check Password");
      }
    }else{
      alert("Please Check Email");
    }
  }

}
