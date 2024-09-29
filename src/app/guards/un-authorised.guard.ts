import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class unAuthorisedGuard implements CanActivate{
  
  constructor(private _router : Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    var userLogin = localStorage.getItem("userObjectData");
    if(userLogin != null){
      return true;
    }else{
      alert("You cant Access this Page with out Login !..");
      this._router.navigate([""]);
      return false;
    }
  }
  
}