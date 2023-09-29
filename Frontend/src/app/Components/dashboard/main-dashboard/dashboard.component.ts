import { Component, OnInit } from "@angular/core";
import { UserService } from "../../user/user.service";
import { DashboardService } from "./dashboard.service";
import { Link, Links } from "../../../Interfaces/Link";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  // Checks for user
  constructor(
    private userService: UserService,
    private dashboardService: DashboardService,
  ) {}

  user: any;
  tab = "Dashboard";
  links: Link[] = [];

  test() {
    console.log(this.links[0]);
  }

  ngOnInit(): void {
    this.user = this.userService.getUser();
    this.getLinks();
  }

  getLinks(): void {
    this.dashboardService
      .getLinks()
      .subscribe((result) => (this.links = result));
  }

  // Logout
  logOut(): void {
    this.userService.logOutUser();
  }
  createForm: boolean = false;
  toggleForm(): void {
    this.createForm = !this.createForm;
  }
  selectTab(element: HTMLElement): void {
    this.tab = String(element.querySelector(".tab-id")?.textContent);
  }
}
