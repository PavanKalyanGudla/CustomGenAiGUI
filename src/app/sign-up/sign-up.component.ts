import { Component, ViewChild } from '@angular/core';

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
  password: String = "";
  confirmPassword: String = "";
  
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
  submitForm(){
    alert("Submitted");
  }
}
