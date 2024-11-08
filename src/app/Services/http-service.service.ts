import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http'
import { User } from '../Model/user';
import { ResponseObj } from '../Model/response-obj';
import { ChatTransaction } from '../Model/chat-transaction';
import { filter, map, Observable } from 'rxjs';
import { ImageChatHistory } from '../Model/image-chat-history';
import { ImageAnalysisTransaction } from '../Model/image-analysis-transaction';
import { TranslationTransaction } from '../Model/translation-transaction';
import { ResumeAnalysisTransaction } from '../Model/resume-analysis-transaction';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  // private host : string = "http://localhost:8080";
  // private host : string = "http://ec2-18-117-143-57.us-east-2.compute.amazonaws.com:8080";

  private host : string = environment.apiUrl;

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

  updateUserInfo(user : User){
    return this._httpClient.post<ResponseObj>(this.host+"/updateUser",user);
  }

  uploadUserProfile(userId:String,file : File):any{
    const formData = new FormData();
    formData.append('file',file);
    return this._httpClient.post(this.host+"/uploadUserProfile?userId="+userId,formData, {responseType : 'text'});
  }

  getProfilePic(email : String, password : String):any{
    return this._httpClient.get(this.host+"/getProfilePic?email="+email+"&password="+password,{responseType:'arraybuffer',});
  }

  chatGptApi(user:User,prompt:String):any{
    const request = {
      user : user,
      prompt : prompt
    };
    return this._httpClient.post(this.host+"/chatGptApi",request,{responseType : 'text'});
  }

  getChatHistory(email : String, password : String):Observable<{ [date: string]: ChatTransaction[] }>{
    return this._httpClient.get<{ [date: string]: ChatTransaction[] }>(this.host+"/getChatHistory?email="+email+"&password="+password);
  }

  imageChatGptApi(user:User,prompt:String):any{
    const request = {
      user : user,
      prompt : prompt
    };
    return this._httpClient.post(this.host+"/imageGptApi",request,{responseType : 'arraybuffer'});
  }

  imageAnalysisApi(userId:String,prompt:String,file : File):any{
    const formData = new FormData();
    formData.append('file',file);
    return this._httpClient.post(this.host+"/imageAnalysis?userId="+userId+"&prompt="+prompt,formData, {responseType : 'text'});
  }

  getImageChatHistory(email : String, password : String):Observable<{[date: string]: ImageChatHistory[]}>{
    return this._httpClient.get<{[date: string]: ImageChatHistory[]}>(this.host+"/getImageChatHistory?email="+email+"&password="+password);
  }

  getImageAnalysisHistory(email : String, password : String):Observable<{[date: string]: ImageAnalysisTransaction[]}>{
    return this._httpClient.get<{[date: string]: ImageAnalysisTransaction[]}>(this.host+"/getImageAnalysisHistory?email="+email+"&password="+password);
  }

  translate(text:String,sourceLanguage:String,targetLanguage:String,userId:String){
    return this._httpClient.get(this.host+"/translate?sourceLanguage="+sourceLanguage+"&targetLanguage="+targetLanguage+"&text="+text+"&userId="+userId,{responseType : 'text'});
  }

  getTranslate(userId:String){
    return this._httpClient.get<{[date: string]: TranslationTransaction[]}>(this.host+"/getUserTranslations?userId="+userId);
  }
 
  resumeAnalyzer(userId:String,role:String,file : File):any{
    const formData = new FormData();
    formData.append('file',file);
    return this._httpClient.post(this.host+"/resumeAnalyzer?userId="+userId+"&role="+role,formData, {responseType : 'text'});
  }

  getResumeAnalysisHistory(email : String, password : String):Observable<{[date: string]: ResumeAnalysisTransaction[]}>{
    return this._httpClient.get<{[date: string]: ResumeAnalysisTransaction[]}>(this.host+"/getResumeAnalysisHistory?email="+email+"&password="+password);
  }

}
