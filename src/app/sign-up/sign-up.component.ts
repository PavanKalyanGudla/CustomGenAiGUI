import { Component, ViewChild } from '@angular/core';
import { User } from '../Model/user';
import { HttpService } from '../Services/http-service.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {

  showPassColor:boolean=false;
  showConfPassColor:boolean=false;
  @ViewChild('showPass') showPass: any;
  @ViewChild('showConfPass') showConfPass: any;

  userId:String = "";
	firstName:String = "";
	lastName:String = "";
	email:String = "";
  password: String = "";
  confirmPassword: String = "";
	profilePic:Blob | undefined;
	dateOfJoin:String | undefined;

  userObj : User | undefined;

  ngOnInit(){}

  constructor(private _httpService : HttpService){}
  
  showPassword(){
    if(this.showPass.nativeElement.type=='password'){
      this.showPass.nativeElement.type='text';
      this.showPassColor=true;
    }else if(this.showPass.nativeElement.type=='text'){
      this.showPass.nativeElement.type='password';
      this.showPassColor=false;
    }
  }

  showConfirmPassword(){
    if(this.showConfPass.nativeElement.type=='password'){
      this.showConfPass.nativeElement.type='text';
      this.showConfPassColor=true;
    }else if(this.showConfPass.nativeElement.type=='text'){
      this.showConfPass.nativeElement.type='password';
      this.showConfPassColor=false;
    }
  }

  verifyPassword(): boolean {
    let password : string= this.password as string;
    if(password === "")
      return true;
    const minLength = /.{9,15}/;
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const hasUpperCase = /[A-Z]/;
    const hasLowerCase = /[a-z]/;
    const hasNumber = /\d/;
    const meetsLength = minLength.test(password);
    const hasSpecial = hasSpecialChar.test(password);
    const hasUpper = hasUpperCase.test(password);
    const hasLower = hasLowerCase.test(password);
    const hasNum = hasNumber.test(password);
    return meetsLength && hasSpecial && hasUpper && hasLower && hasNum;
  }

  verifyConfirmPassword(): boolean{
    let password : string= this.confirmPassword as string;
    if(password === "")
      return true;
    const minLength = /.{9,15}/;
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const hasUpperCase = /[A-Z]/;
    const hasLowerCase = /[a-z]/;
    const hasNumber = /\d/;
    const meetsLength = minLength.test(password);
    const hasSpecial = hasSpecialChar.test(password);
    const hasUpper = hasUpperCase.test(password);
    const hasLower = hasLowerCase.test(password);
    const hasNum = hasNumber.test(password);
    return meetsLength && hasSpecial && hasUpper && hasLower && hasNum;
  }

  signUp(){
    var errorMsg = this.validateUserObject();
    const today = new Date();
    if(errorMsg.length == 0){
      this.userObj = new User();
      this.userObj.userId=this.email.split("@")[0];
      this.userObj.firstName=this.firstName;
      this.userObj.lastName=this.lastName;
      this.userObj.email=this.email;
      this.userObj.dateOfJoin=today.toDateString()
      this.userObj.password=this.password;
      console.log(this.userObj);
      this._httpService.userRegistration(this.userObj).subscribe((data) => {
        alert(data);
      });
      this.userObj = new User();
      this.firstName="";
      this.lastName="";
      this.email="";
      this.password="";
      this.confirmPassword="";
    }else{
      alert(errorMsg);
    }
  }

  validateUserObject():Array<string>{
    let errorMsg = new Array<string>;
    !(this.firstName != null && this.firstName != undefined && this.firstName != "")? errorMsg.push("Please Check firstName"):"";
    !(this.lastName != null && this.lastName != undefined && this.lastName != "")? errorMsg.push("Please Check lastName"):"";
    !(this.email != null && this.email != undefined && this.email != "")? errorMsg.push("\nPlease Check email"):"";
    !(this.password != null && this.password != undefined && this.password != "")? errorMsg.push("\nPlease Check password"):"";
    !(this.confirmPassword != null && this.confirmPassword != undefined && this.confirmPassword != "")? errorMsg.push("\nPlease Check ConfirmPassword"):"";
    (this.password != this.confirmPassword)? errorMsg.push("\nPassword & Confirm Password Not Matched"):"";
    return errorMsg;
  }

  submitForm(){
    alert("Submitted");
  }

}
