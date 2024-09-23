import { User } from "./user";

export class ResponseObj {
    responseMsg:String | undefined;
	responseCode:String | undefined;
	responseModel!: User;
}
