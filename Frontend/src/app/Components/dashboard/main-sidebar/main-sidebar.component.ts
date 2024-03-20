import { Component, OnInit } from "@angular/core";
import { UserService } from "../../user/user.service";

@Component({
  selector: "app-main-sidebar",
  templateUrl: "./main-sidebar.component.html",
  styleUrls: ["./main-sidebar.component.scss"],
})
export class MainSidebarComponent implements OnInit {
  constructor(private userService: UserService) {}
  user: any;

  ngOnInit(): void {
    this.user = this.userService.getUser()?.user;
  }

  logOut(): void {
    this.userService.logOutUser();
  }
}
