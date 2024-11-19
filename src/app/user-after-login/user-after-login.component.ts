import { ChangeDetectorRef, Component, ElementRef, HostListener, NgIterable, ViewChild } from '@angular/core';
import { User } from '../Model/user';
import { Router } from '@angular/router';
import { HttpService } from '../Services/http-service.service';
import { ChatTransaction } from '../Model/chat-transaction';
import { ImageChatHistory } from '../Model/image-chat-history';
import { ImageAnalysisTransaction } from '../Model/image-analysis-transaction';
import { LanguageList } from '../Model/language-list';
import { TranslationTransaction } from '../Model/translation-transaction';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { ResumeAnalysisTransaction } from '../Model/resume-analysis-transaction';
import { ResponseObj } from '../Model/response-obj';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PromptRequest } from '../Model/PromptRequest';
import { GifChatHistory } from '../Model/gif-chat-history';

@Component({
  selector: 'app-user-after-login',
  templateUrl: './user-after-login.component.html',
  styleUrls: ['./user-after-login.component.css']
})
export class UserAfterLoginComponent{

  userObj : User = new User();
  userObjEdit : User = new User();
  public editProfile : any;
  public accountSettings : any;
  public helpSupport : any;
  public viewResume : any;
  public micSoundOn : any;
  public micSoundOff : any;
  gifPrompt : PromptRequest = new PromptRequest();
  selectedFile: File | null = null;
  analysisFile: File | null = null;
  resumeFile: File | null = null;
  profileFlag:boolean=false;
  profilePicSrc: string | ArrayBuffer | undefined;
  imageAnalysisSrc: ArrayBuffer | undefined;
  heading:String = "Unlock the Power of Generative AI";
  userSettingsFlag:String="none";
  displayTransFlag:String="none";
  inputMsg1:String="";
  infoFlag:boolean=false;
  transactionList: Array<{ question: String, image?:String, answer: any }> = [];
  messageList: Array<{ question: String, answer: any }> = [];
  imageAnalysisList: Array<{ question: String, image:String, answer: any }> = [];
  resumeAnalysisList : Array<{ question: String, fileName: String, roleType:String, answer: any }> = [];
  imageList: Array<{ question: String, answer: any }> = [];
  gifList:Array<{question: String, answer:any}> = [];
  translatorList: Array<{ question: String, answer: any }> = [];
  transactionsMap: { [date: string]: ChatTransaction[] | ImageChatHistory[] | ImageAnalysisTransaction[] | TranslationTransaction[] | ResumeAnalysisTransaction[] | GifChatHistory[]} = {};
  chatTransactionsMap: { [date: string]: ChatTransaction[] } = {};
  imageChatTransactionsMap: { [date: string]: ImageChatHistory[] } = {};
  gifChatTransactionsMap : {[date: string]: GifChatHistory[]} = {};
  imageAnalysisTransactionsMap: { [date: string]: ImageAnalysisTransaction[] } = {};
  resumeAnalysisTransactionsMap: { [date: string]: ResumeAnalysisTransaction[] } = {};
  translationTransactionMap : {[date: string]: TranslationTransaction[]} = {};
  selectedService:String="gptbot";
  resumeAnaFlag:boolean = false;
  languageList = new LanguageList();
  paragraph:String="Generative AI is transforming the way we interact with technology, from creating text and art to answering complex questions. Explore the limitless potential of AI-driven innovation and creativity!";
 
  @ViewChild('uploadInput') uploadInput!: ElementRef;
  @ViewChild('sendButton', { static: false }) sendButton!: ElementRef;

  recognition: any;
  isListening: boolean = false;
  
  constructor(private _router : Router, 
    private _httpService : HttpService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ){}

  ngOnInit(){
    let userObjStr = localStorage.getItem("userObjectData");
    if(userObjStr != null){
      this.userObj = JSON.parse(userObjStr);
      this.userObjEdit = JSON.parse(userObjStr);
      this.editProfile = document.getElementById("editProfile");
      this.accountSettings = document.getElementById("accountSettings");
      this.helpSupport = document.getElementById("helpSupport");
      this.viewResume = document.getElementById("viewResume");
      this.micSoundOn = document.getElementById('micSoundOn');
      this.micSoundOff = document.getElementById('micSoundOff');
      this.transactionsMap={};
      this.transactionList=[];
      this.getProfilePic();
      this.getChatHistory();
      this.getImageChatHistory();
      this.getImageAnalysisHistory();
      this.getTranslate();
      this.getResumeAnalysisHistory();
      this.getGifChatHistory();
    }
    const fileInput = document.getElementById('fileInput');
    if(fileInput){
      fileInput.addEventListener('change',()=>{
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          if (window.confirm('Are you sure?, Do you want to change the profile pic.')) {
            this.selectedFile = fileInput.files[0];
            console.log('File selected:', fileInput.files[0].name);
            this.compressProfilePic();
          }
        } else {
          console.log('No file selected');
        }
      });
    }
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support the Web Speech API. Please use a supported browser like Chrome.");
    }else {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = true;
      this.recognition.continuous = true;
      this.recognition.onresult = (event: any) => {
        let transcript = '';        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          transcript += result[0].transcript;
        }
        this.inputMsg1 = transcript;
      };
      this.recognition.onend = () => {
        this.isListening = false;
      };
    }

  }

  ngAfterViewInit(): void {
    if (!this.uploadInput) {
      console.error('File image element is null');
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendButton.nativeElement.click();
    }
  }

  uploadImage(){
    if (this.uploadInput) {
      this.uploadInput.nativeElement.click();
    } else {
      console.error('File image element is not available for Analysis');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if(input && input.files && input.files.length > 0){
      this.analysisFile = input.files[0];
    }
    if (!this.analysisFile) {
      alert('No file selected');
    }
  }
  
  logOut(){
    localStorage.clear();
    this._router.navigate([""]);
  }

  openSettings(){
    this.isSidebarActive = false;
    this.logoFlag = true;
    this.userSettingsFlag = "block";
  }

  closeSettingsPopup(){ 
    this.userSettingsFlag = "none"; 
  }

  editProfilePopUp(){
    this.isSidebarActive = false;
    this.logoFlag = true;
    (this.editProfile != null)?this.editProfile.style.display = "block":"";
    this.userObjEdit = JSON.parse(localStorage.getItem("userObjectData")+"");
  }

  closeEditProfilePopUp(){ 
    (this.editProfile != null)? this.editProfile.style.display = "none":""; 
  }

  openAccountSettingsPopup(){
    this.isSidebarActive = false;
    this.logoFlag = true;
    (this.accountSettings != null)? this.accountSettings.style.display = "block" : "";
    this.userObjEdit = JSON.parse(localStorage.getItem("userObjectData")+"");
    this.password = "";
    this.confirmPassword = "";
  }

  closeAccountSettingsPopup(){ 
    (this.accountSettings != null)?this.accountSettings.style.display = "none":""; 
  }

  openHelpSupport(){
    this.isSidebarActive = false;
    this.logoFlag = true;
    (this.helpSupport != null)?this.helpSupport.style.display = "block" : ""; 
  }

  closeHelpSupport(){ 
    (this.helpSupport != null)?this.helpSupport.style.display = "none" : ""; 
  }

  compressProfilePic() {
    if (this.selectedFile) {
      console.log('Original file size:', this.selectedFile.size, 'bytes');
      const reader = new FileReader();
      reader.onload = (event) => {
        const target = event?.target;
        if (!target) {
          console.error('Event target is null or undefined.');
          return;
        }
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.error('Unable to get canvas context.');
            return;
          }
          const maxWidth = 800;
          const maxHeight = 600;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('Error creating blob.');
              return;
            }
            const compressedFile = new File([blob], 'compressed_image.jpg', { type: 'image/jpeg' });
            this.selectedFile=compressedFile;
            const compressedSize = this.selectedFile.size;
            this.SubmitProfilePic(compressedFile);
            console.log('Compressed file size:', compressedSize, 'bytes');
            }, 'image/jpeg', 0.3);
        };
        img.src = target.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  SubmitProfilePic(file: File) {
    if (!file) {
      alert('No file selected.');
      return;
    }
    this._httpService.uploadUserProfile(this.userObj.userId, file).subscribe((data: any) => {
      alert(data);
      if (data) {
        this.getProfilePic();
      }
    });
  }

  getProfilePic(){
    this._httpService.getProfilePic(this.userObj.email,this.userObj.password).subscribe((data : any) =>{
      const reader = new FileReader();
      this.profilePicSrc = "";
      reader.onload = () => {
        this.profilePicSrc = reader.result ?? '';
        if(this.profilePicSrc === "data:application/octet-stream;base64,"){
          this.profileFlag = false;
        }else{
          this.profileFlag = true;
        }
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(new Blob([data]));
    })
  }
  streamedData : string="";
  getResponse(){
    if(this.inputMsg1!="" && this.inputMsg1!=" " &&this.inputMsg1.trim()!=""){
      if(this.selectedService=='gptbot'){
        this.loadingFlag = true;
        this._httpService.chatGptApi(this.userObj,this.inputMsg1).subscribe((data:any) =>{
          let text = data;
          this.messageList.push({ question: this.inputMsg1, answer: text});
          this.loadingFlag = false;
          this.inputMsg1=""
          this.getChatHistory();
        })
      }else if(this.selectedService=="imagegenerate"){
        this.loadingFlag = true;
        this._httpService.imageChatGptApi(this.userObj,this.inputMsg1).subscribe((data:ArrayBuffer) => {
          let blob = new Blob([data], { type: 'image/jpeg' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            let image = reader.result;
            this.imageList.push({ question: this.inputMsg1, answer: image });
            this.inputMsg1=""
            this.loadingFlag = false;
          };
          this.getImageChatHistory();
        })
      }else if(this.selectedService=="imageanalysis"){
        if(this.analysisFile){
          this.loadingFlag = true;
          this._httpService.imageAnalysisApi(this.userObj.userId, this.inputMsg1, this.analysisFile).pipe(
            switchMap((data: any) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const arrayBuffer = reader.result as ArrayBuffer;
                this.imageAnalysisSrc = arrayBuffer;
                this.inputMsg1 = "";
              };
              this.loadingFlag = false;
              return this.getImageAnalysisHistory1();
            })
          ).subscribe(() => {
            this.transactionsMap = this.imageAnalysisTransactionsMap;
            this.transactionList = this.imageAnalysisList;
            this.infoFlag = true;
          });
        }
      }else if(this.selectedService == "gifgenerate"){
        this.loadingFlag = true;
        this.gifPrompt.prompt = this.inputMsg1;
        this.gifPrompt.user = this.userObj;
        this._httpService.generateGif(this.gifPrompt)
        .pipe(
          switchMap((data:ArrayBuffer) => {
            let blob = new Blob([data], { type: 'image/gif' });
            const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            let gif = reader.result;
            this.gifList.push({question:this.inputMsg1,answer:gif});
            this.inputMsg1=""
            this.loadingFlag = false;
          };
          return this.getGifChatHistory1();
          })
        )
        .subscribe((data:ArrayBuffer) =>{
          this.transactionsMap = this.gifChatTransactionsMap;
            this.transactionList = this.gifList;
        })
      }
    }
  }

  getChatHistory(){
    this._httpService.getChatHistory(this.userObj.email,this.userObj.password).subscribe((data) =>{
      this.chatTransactionsMap=data;
      this.transactionsMap = this.chatTransactionsMap;
      if(this.chatTransactionsMap != null){
        this.addTodaysChatTransactionsToMessageList(this.getFormattedDate());
      }
    })
  }

  getImageChatHistory(){
    this._httpService.getImageChatHistory(this.userObj.email,this.userObj.password).subscribe((data) =>{
      this.imageChatTransactionsMap=data;
      if(this.imageChatTransactionsMap != null){
        this.addTodaysImageChatTransactionsToMessageList(this.getFormattedDate());
      }
    })
  }

  getGifChatHistory(){
    this._httpService.getGifChatHistory(this.userObj.email,this.userObj.password).subscribe((data) =>{
      this.gifChatTransactionsMap = data;
      this.addTodaysGifChatTransactionsToMessageList(this.getFormattedDate());
    })
  }

  getImageAnalysisHistory(){
    this._httpService.getImageAnalysisHistory(this.userObj.email,this.userObj.password).subscribe((data) =>{
      this.imageAnalysisTransactionsMap=data;
      this.addTodaysImageAnalysisTransactionsToMessageList(this.getFormattedDate());
    })
  }

  getImageAnalysisHistory1(): Observable<{ [date: string]: ImageAnalysisTransaction[]; }> {
    return this._httpService.getImageAnalysisHistory(this.userObj.email, this.userObj.password).pipe(
      tap((data) => {
        this.imageAnalysisTransactionsMap = data;
        this.addTodaysImageAnalysisTransactionsToMessageList(this.getFormattedDate());
      })
    );
  }  

  getGifChatHistory1() : Observable<{[date: string]: GifChatHistory[]}>{
    return this._httpService.getGifChatHistory(this.userObj.email,this.userObj.password).pipe(
      tap((data) => {
        this.gifChatTransactionsMap = data;
        this.addTodaysGifChatTransactionsToMessageList(this.getFormattedDate());
      })
    );
  }

  compareFn = (a: any, b: any): number => {
    const dateA = new Date(a.key).getTime();
    const dateB = new Date(b.key).getTime();
    return dateB - dateA;
  };

  selectService(){
    this.transactionList=[];
    this.transactionsMap={};
    if(this.selectedService=="gptbot"){
      this.heading = "Unlock the Power of Generative AI";
      this.transactionList=this.messageList;
      this.transactionsMap=this.chatTransactionsMap;
    }else if(this.selectedService=="imagegenerate"){
      this.heading = "Unleash Creativity with Gen AI";
      this.transactionList = this.imageList;
      this.transactionsMap = this.imageChatTransactionsMap;
    }else if(this.selectedService=="imageanalysis"){
      this.heading = "Transform Your Insights with Gen AI";
      this.transactionList = this.imageAnalysisList;
      this.transactionsMap= this.imageAnalysisTransactionsMap;
    }else if(this.selectedService=="translate"){
      this.heading = "Break Language Barriers with Gen AI";
      this.transactionsMap = this.translationTransactionMap
    }else if(this.selectedService=="resume"){
      this.heading = "Elevate Your Hiring Process with Gen AI";
      this.transactionsMap = this.resumeAnalysisTransactionsMap;
    }else if(this.selectedService=="gifgenerate"){
      this.heading = "Fast and easy GIF creation.";
      this.transactionList = this.gifList;
      this.transactionsMap = this.gifChatTransactionsMap;
    }
    this.infoFlag=(this.transactionList.length != 0)?true:false;
  }

  selectService1(value : any){
    this.selectedService=value;
    this.selectService();
  }

  loadTransaction(e : any){
    if(this.selectedService=="gptbot"){
      this.addTodaysChatTransactionsToMessageList(e);
    }else if(this.selectedService=="imagegenerate"){
      this.addTodaysImageChatTransactionsToMessageList(e);
      this.transactionList = this.imageList;
    }else if(this.selectedService=="imageanalysis"){
      this.addTodaysImageAnalysisTransactionsToMessageList(e);
      this.transactionList = this.imageAnalysisList;
    }else if(this.selectedService=="translate"){
      this.addTodaysTranslationTransactionsToMessageList(e);
      this.openDisplayTransPopUp();
    }else if(this.selectedService=="gifgenerate"){
      this.addTodaysGifChatTransactionsToMessageList(e);
      this.transactionList = this.gifList;
    }else if(this.selectedService=="resume"){
    }
    this.infoFlag = (this.transactionList.length>0)?true:false;
  }

  getFormattedDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  addTodaysChatTransactionsToMessageList(date : any) {
    const today = date;
    if (this.chatTransactionsMap.hasOwnProperty(today)) {
      this.messageList=[];
      this.chatTransactionsMap[today].forEach(transaction => {
        this.messageList.push({
          question: transaction.question,
          answer: transaction.answer
        });
      });
      this.transactionList = this.messageList;
      // this.scrollDown.scrollDown = this.scrollDown.scrollHeight;
      // alert(this.scrollDown.scrollHeight);
      if(this.messageList.length != 0 && date == this.getFormattedDate()){
        this.infoFlag = true;
      }else{
        this.infoFlag = false;
      }
    }
  }

  addTodaysImageChatTransactionsToMessageList(date : any) {
    const today = date;
    if (this.imageChatTransactionsMap.hasOwnProperty(today)) {
      this.imageList=[];
      this.imageChatTransactionsMap[today].forEach(transaction => {
        this.imageList.push({
          question: transaction.question,
          answer: "data:application/octet-stream;base64,"+transaction.answer
        });
      });
      if(this.messageList.length != 0 && date == this.getFormattedDate()){
        this.infoFlag = true;
      }else{
        this.infoFlag = false;
      }
      this.cdr.detectChanges();
    }
  }

  addTodaysGifChatTransactionsToMessageList(date : any) {
    const today = date;
    if (this.gifChatTransactionsMap.hasOwnProperty(today)) {
      this.gifList=[];
      this.gifChatTransactionsMap[today].forEach(transaction => {
        this.gifList.push({
          question: transaction.question,
          answer: "data:application/octet-stream;base64,"+transaction.answer
        });
      });
      if(this.messageList.length != 0 && date == this.getFormattedDate()){
        this.infoFlag = true;
      }else{
        this.infoFlag = false;
      }
      console.log(this.transactionsMap['length']+""+this.gifChatTransactionsMap['length']);
      this.cdr.detectChanges();
    }
  }

  addTodaysImageAnalysisTransactionsToMessageList(date : any) {
    const today = date;
    if (this.imageAnalysisTransactionsMap.hasOwnProperty(today)) {
      this.imageAnalysisList=[];
      this.imageAnalysisTransactionsMap[today].forEach(transaction => {
        this.imageAnalysisList.push({
          question: transaction.question,
          image: "data:application/octet-stream;base64,"+transaction.image,
          answer: transaction.answer
        });
      });
      this.cdr.detectChanges();
    }
  }

  sourceLang : String="";
  targetLang : String="";
  sourceText : String="";
  targetText : String="";
  sourceLangSelect(event:Event){
    const target = event.target as HTMLSelectElement | null;
    if (target) {
      this.sourceLang = target.value;
    }
  }
  targetLangSelect(event:any){
    const target = event.target as HTMLSelectElement | null;
    if (target) {
      this.targetLang = target.value;
    }
  }

  translate() {
    if ("" == this.sourceLang || "" == this.targetLang || "" == this.sourceText.trim()) {
      alert("Please Check Source/Target Language selection Or Source Text field Empty");
    } else {
      this._httpService.translate(this.sourceText, this.sourceLang, this.targetLang, this.userObj.userId)
        .pipe(
          switchMap((data: string) => {
            this.targetText = data;
            if (data) {
              return this.getTranslateCopy();
            } else {
              return of(null);
            }
          })
        )
        .subscribe(() => {
          this.transactionsMap = this.translationTransactionMap;
          this.cdr.detectChanges();
        });
    }
  }

  getTranslate(){
    this._httpService.getTranslate(this.userObj.userId).subscribe((data) =>{
      this.translationTransactionMap = data;
    });
  }

  getTranslateCopy(): Observable<any> {
    return this._httpService.getTranslate(this.userObj.userId).pipe(
      tap((data) => {
        this.translationTransactionMap = data;
      })
    );
  }

  getIterableValue(value: PossibleTransactionArray | null | undefined): NgIterable<any> {
    return value ?? [];
  }
  
  items: { value: PossibleTransactionArray | null | undefined }[] = [
    { value: [] },
  ];

  openDisplayTransPopUp(){
    this.displayTransFlag="block";
  }

  addTodaysTranslationTransactionsToMessageList(date : any) {
    const today = date;
    if(this.translationTransactionMap.hasOwnProperty(today)) {
      this.translatorList=[];
      this.translationTransactionMap[today].forEach(transaction => {
        this.translatorList.push({question: transaction.question,answer: transaction.answer});
      });
      this.cdr.detectChanges();
    }
  }

  closeDisplayTransPopUp(){
    this.displayTransFlag="none";
  }

  resumeAnalyResp : string = "";
  resumeRole : String = "";
  loadingFlag : boolean = false;

  uploadResume(){
    if(this.resumeFile){
      if(""!=this.resumeRole.trim()){
        this.loadingFlag = true;
        this._httpService.resumeAnalyzer(this.userObj.userId,this.resumeRole,this.resumeFile).pipe(
          switchMap((data: any) => {
            this.resumeAnalyResp=data;
            this.resumeAnaFlag = true;
            this.loadingFlag = false;
            return this.getResumeAnalysisHistory1();
          })
        ).subscribe(() => {
          this.transactionsMap = this.resumeAnalysisTransactionsMap;
        });
      }else{
        alert("Missing to add your Job Role Description");
        this.loadingFlag = false;
      }
    }
  }

  getResumeAnalysisHistory(){
    this._httpService.getResumeAnalysisHistory(this.userObj.email,this.userObj.password).subscribe((data) =>{
      this.resumeAnalysisTransactionsMap=data;
      this.addTodaysResumeAnalysisTransactionsToMessageList(this.getFormattedDate());
    })
  }

  getResumeAnalysisHistory1(): Observable<{ [date: string]: ResumeAnalysisTransaction[] }> {
    return this._httpService.getResumeAnalysisHistory(this.userObj.email, this.userObj.password).pipe(
      tap((data) => {
        this.resumeAnalysisTransactionsMap = data;
        this.addTodaysResumeAnalysisTransactionsToMessageList(this.getFormattedDate());
      })
    );
  }

  addTodaysResumeAnalysisTransactionsToMessageList(date : any) {
    const today = date;
    if (this.resumeAnalysisTransactionsMap.hasOwnProperty(today)) {
      this.resumeAnalysisList=[];
      this.resumeAnalysisTransactionsMap[today].forEach(transaction => {
        this.resumeAnalysisList.push({
          question: transaction.fileName,
          fileName: transaction.fileName,
          roleType: transaction.roleType,
          answer: transaction.answer
        });
      });
      this.cdr.detectChanges();
    }
  }

  resetResume(resumeFileId: HTMLInputElement){
    this.resumeAnalyResp = "";
    this.resumeRole = "";
    this.resumeAnaFlag = false;
    resumeFileId.value = '';
  }

  selectResume(event: Event){
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.resumeFile = input.files[0];
    }
  }

  saveUserInfoChanges(){
    this._httpService.updateUserInfo(this.userObjEdit).subscribe((data) =>{
      let response : ResponseObj = data;
      alert(response.responseMsg)
      if(response.responseCode == "200"){
        this.userObj = response.responseModel;
        localStorage.setItem("userObjectData",JSON.stringify(this.userObj));
        let userObjString:any = localStorage.getItem("userObjectData");
        this.userObjEdit = JSON.parse(userObjString);
      }
    })
  }

  password: String = "";
  confirmPassword: String = "";
  showPassColor:boolean=false;
  showConfPassColor:boolean=false;
  @ViewChild('showPass') showPass: any;
  @ViewChild('showConfPass') showConfPass: any;
  
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

  changePassword(){
    this.userObjEdit = JSON.parse(localStorage.getItem("userObjectData")+"");
    if(this.password == this.confirmPassword){
      this.userObjEdit.password = this.password;
      this._httpService.updateUserInfo(this.userObjEdit).subscribe((data) =>{
        let response : ResponseObj = data;
        if(response.responseCode == "200"){
          alert("Password Changed Successfully");
          this.userObj = response.responseModel;
          localStorage.setItem("userObjectData",JSON.stringify(this.userObj));
          let userObjString:any = localStorage.getItem("userObjectData");
          this.userObjEdit = JSON.parse(userObjString);
        }else{
          alert("Failed To Update Password");
        }
      })
    }else{
      alert("Confirm Password Mis matched");
    }
  }
  activeTab: string = 'One';
  selectedResume : ResumeAnalysisTransaction = new ResumeAnalysisTransaction();
  fileUrl: string | undefined;
  safeUrl: SafeResourceUrl | undefined;

  openResume(obj : ResumeAnalysisTransaction){
    (this.viewResume != null)?this.viewResume.style.display = "block":"";
    this.selectedResume = obj;
    console.log(this.selectedResume);
    this.convertToBlob(this.selectedResume.resumeFile);
    this.openPage(this.activeTab);
  }

  convertToBlob(base64String: string) {
    const byteCharacters = atob(base64String);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset++) {
      const byte = byteCharacters.charCodeAt(offset);
      byteArrays.push(byte);
    }
    const byteArray = new Uint8Array(byteArrays);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const blobURL = URL.createObjectURL(blob);
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobURL);
  }

  openPage(pageName: string): void {
    this.activeTab = pageName;
  }

  closeResume(){
    speechSynthesis.cancel();
    (this.viewResume != null)?this.viewResume.style.display = "none":"";
  }

  ngOnDestroy() {
    if (this.fileUrl) {
      URL.revokeObjectURL(this.fileUrl);
    }
  }
  isSidebarActive = false;
  logoFlag = true;
  leftContainerEvent() {
    this.isSidebarActive = !this.isSidebarActive;
    this.logoFlag = !this.logoFlag;
  }
  adjustWidth(event: any, textareaId: string) {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.width = 'auto';
      textarea.style.width = `${textarea.scrollWidth + 10}px`;
    }
  }

  micOn:boolean = false;
  recognizedText: string = '';
  changeMicOption(){
    this.micOn = !this.micOn;
    if(this.micOn==true){
      this.startListening();
    }else{
      this.stopListening();
    }
    this.cdr.detectChanges();
  }
  startListening(): void {
    if(this.micSoundOn){
      this.micSoundOn.play();
      this.micSoundOff.currentTime=0;
    }
    if (this.recognition && !this.isListening) {
      this.inputMsg1="";
      this.recognition.start();
      this.isListening = true;
    }
  }
  stopListening(): void {
    if(this.micSoundOff){
      this.micSoundOff.play();
      this.micSoundOn.currentTime=0;
    }
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
  readUp:boolean=false;
  startOrStopRead(inputText: any): void {
    this.readUp = !this.readUp;
    if ('speechSynthesis' in window) {
      if (!this.readUp) {
        speechSynthesis.cancel();
      } else {
        if (inputText && inputText.trim() !== "") {
          const utterance = new SpeechSynthesisUtterance(inputText);
          utterance.lang = 'en-US';  
          utterance.onend = () => {
            this.readUp = false;
          };
          utterance.onerror = (error) => {
            console.error('Speech synthesis error:', error);
            this.readUp = false;
          };
          speechSynthesis.speak(utterance);
        } else {
          alert("Please provide some text to speak.");
          this.readUp = false;
        }
      }
    } else {
      alert("Your browser does not support the Web Speech API for Text-to-Speech.");
    }
  }
  
}

type PossibleTransactionArray = ChatTransaction[] | ImageChatHistory[] | ImageAnalysisTransaction[] | TranslationTransaction[] | ResumeAnalysisTransaction[];
