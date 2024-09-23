import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { User } from '../Model/user';
import { ResponseObj } from '../Model/response-obj';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private host : string = "http://localhost:8080";

  constructor(private _httpClient : HttpClient) { }

  userRegistration(user : User){
    return this._httpClient.post(this.host+"/addUser",user,{responseType: 'text'});
  }

  getPassword(email : String){
    return this._httpClient.get(this.host+"/forgotPassword?email="+email,{responseType: 'text'});
  }

  userLogin(email : String, password : String){
    return this._httpClient.get<ResponseObj>(this.host+"/loginUser?email="+email+"&password="+password);
  }

}
