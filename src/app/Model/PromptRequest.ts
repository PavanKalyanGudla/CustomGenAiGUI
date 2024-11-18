import { User } from "./user";

export class PromptRequest{
    prompt:String | undefined;
    imageCount:number | undefined = 3;
    frameDelay:number | undefined = 500;
    user !: User;
}