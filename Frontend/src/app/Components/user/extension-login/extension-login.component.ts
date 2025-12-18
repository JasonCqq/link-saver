import { Component } from "@angular/core";
import { UserService } from "../user.service";

@Component({
  selector: "app-extension-login",
  imports: [],
  templateUrl: "./extension-login.component.html",
  styleUrl: "./extension-login.component.scss",
})
export class ExtensionLoginComponent {
  constructor(private userService: UserService) {
    this.user = this.userService.getUser()?.user;
  }

  user: any;
}
