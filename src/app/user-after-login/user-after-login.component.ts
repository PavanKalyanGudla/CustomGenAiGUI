import { ChangeDetectorRef, Component } from '@angular/core';
import { User } from '../Model/user';
import { Router } from '@angular/router';
import { HttpService } from '../Services/http-service.service';
import { ChatTransaction } from '../Model/chat-transaction';
import { ImageChatHistory } from '../Model/image-chat-history';

@Component({
  selector: 'app-user-after-login',
  templateUrl: './user-after-login.component.html',
  styleUrls: ['./user-after-login.component.css']
})
export class UserAfterLoginComponent {

  userObj : User = new User();
  public editProfile : any;
  selectedFile: File | null = null;
  profileFlag:boolean=false;
  profilePicSrc: string | ArrayBuffer | undefined;
  heading:String = "Unlock the Power of Generative AI";
  public sidebar : any;

  ngOnInit(){
    let userObjStr = localStorage.getItem("userObjectData");
    this.sidebar = document.getElementById('left');
    if(userObjStr != null){
      this.userObj = JSON.parse(userObjStr);
      this.editProfile = document.getElementById("editProfile");
      this.getProfilePic();
      this.getChatHistory();
      this.getImageChatHistory();
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
  }

  constructor(private _router : Router, 
    private _httpService : HttpService,
    private cdr: ChangeDetectorRef
  ){}

  userSettingsFlag:String="none";

  openSettings(){
    this.userSettingsFlag = "block";
  }

  closeSettingsPopup(){
    this.userSettingsFlag = "none";
  }

  logOut(){
    localStorage.clear();
    this._router.navigate([""]);
  }

  editProfilePopUp(){
    if(this.editProfile != null){
      this.editProfile.style.display = "block";
    }
  }

  closeEditProfilePopUp(){
    if(this.editProfile != null){
      this.editProfile.style.display = "none";
    }
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

  inputMsg1:String="";
  infoFlag:boolean=false;
  transactionList: Array<{ question: String, answer: any }> = [];
  messageList: Array<{ question: String, answer: any }> = [];
  imageList: Array<{ question: String, answer: any }> = [];
  getResponse(){
    if(this.inputMsg1!="" && this.inputMsg1!=" " &&this.inputMsg1.trim()!=""){
      if(this.selectedService=='gptbot'){
        this._httpService.chatGptApi(this.userObj,this.inputMsg1).subscribe((data:any) =>{
          let text = data;
          this.messageList.push({ question: this.inputMsg1, answer: text});
          this.getChatHistory();
        })
      }else if(this.selectedService=="imagegenerate"){
        this._httpService.imageChatGptApi(this.userObj,this.inputMsg1).subscribe((data:ArrayBuffer) => {
          let blob = new Blob([data], { type: 'image/jpeg' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            let image = reader.result;
            this.imageList.push({ question: this.inputMsg1, answer: image });
          };
          this.getImageChatHistory();
        })
      }else if(this.selectedService=="imageanalysis"){
        
      }else if(this.selectedService=="translate"){
        
      }else if(this.selectedService=="resume"){
        
      }
      this.inputMsg1 = "";
    }
  }

  transactionsMap: { [date: string]: ChatTransaction[] | ImageChatHistory[] } = {};
  chatTransactionsMap: { [date: string]: ChatTransaction[] } = {};
  imageChatTransactionsMap: { [date: string]: ImageChatHistory[] } = {};
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

  compareFn = (a: any, b: any): number => {
    const dateA = new Date(a.key).getTime();
    const dateB = new Date(b.key).getTime();
    return dateB - dateA;
  };

  selectedService:String="gptbot";
  paragraph:String="Generative AI is transforming the way we interact with technology, from creating text and art to answering complex questions. Explore the limitless potential of AI-driven innovation and creativity!";
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
    }else if(this.selectedService=="translate"){
      this.heading = "Break Language Barriers with Gen AI";
    }else if(this.selectedService=="resume"){
      this.heading = "Elevate Your Hiring Process with Gen AI";
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
    }else if(this.selectedService=="translate"){
    }else if(this.selectedService=="resume"){
    }
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
      if(this.messageList.length == 0){
        this.infoFlag = false;
      }else{
        this.infoFlag = true;
      }
    }
  }

  leftContainerEvent(){
    this.sidebarOpen = !this.sidebarOpen;
  }
  sidebarOpen: boolean = false;

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
      if(this.imageList.length == 0){
        this.infoFlag = false;
      }else{
        this.infoFlag = true;
      }
    }
  }
}
