import { ChangeDetectorRef, Component } from '@angular/core';
import { User } from '../Model/user';
import { Router } from '@angular/router';
import { HttpService } from '../Services/http-service.service';
import { ChatgptResponse } from '../Model/chatgpt-response';

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

  ngOnInit(){
    let userObjStr = localStorage.getItem("userObjectData");
    if(userObjStr != null){
      this.userObj = JSON.parse(userObjStr);
      this.editProfile = document.getElementById("editProfile");
      this.getProfilePic();
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

  SubmitProfilePic(file:File) {
    console.log(file.size);
    if (!file) {
      alert('No file selected.');
      return;
    }
    this._httpService.uploadUserProfile(this.userObj.userId,file).subscribe((data : any)=>{
      alert(data);
      if(data){
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
  messageList: Array<{ question: String, answer: any }> = [];
  getResponse(){
    this._httpService.chatGptApi(this.inputMsg1).subscribe((data:ChatgptResponse) =>{
      let text = data.choices[0].message.content;
      // const element = document.getElementById("typewriter-text");
      // if (index < text.length) {
      //   element.innerHTML += text.charAt(index);
      //   index++;
      //   setTimeout(typeText, 50);
      // }
      this.messageList.push({ question: this.inputMsg1, answer: text});
      this.inputMsg1 = "";
      this.infoFlag=true;
    })
    
  }

  selectedService:String="gptbot";
  selectService(){
    // gptbot
    // imagegenerate
    // imageanalysis
    // translate
    // resume
  }

}
