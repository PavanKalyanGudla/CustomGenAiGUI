export class User {
    userId!: String;
	firstName:String | undefined;
	lastName:String | undefined;
	email!: String;
	password!:String;
	confirmPassword:String | undefined;
	profilePic:Blob | undefined;
	dateOfJoin:String | undefined;
    
}
