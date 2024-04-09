import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { UserService } from "./Components/user/user.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router,
  ) {}
  canActivate(): boolean {
    let isLoggedIn = this.userService.getUser()?.user;
    if (isLoggedIn) {
      return true;
    } else {
      this.router.navigate(["/user/login"]);
      return false;
    }
  }
}
