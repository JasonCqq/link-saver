import { Component, OnInit } from "@angular/core";
import { UserService } from "../user/user.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  // Checks for user
  constructor(private userService: UserService) {}
  user: any;

  ngOnInit(): void {
    this.user = this.userService.getUser();
  }

  // Logout
  logOut(): void {
    this.userService.logOutUser();
  }

  createForm: boolean = false;
  toggleForm(): void {
    this.createForm = !this.createForm;
  }
}
