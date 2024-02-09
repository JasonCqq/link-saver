import { Component, OnInit } from "@angular/core";
import { UserService } from "../../user/user.service";
import { DashboardService } from "../dashboard.service";
import { Link } from "../../../Interfaces/Link";
import { Observable } from "rxjs";

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
  links: Link[] = [];

  temp(): void {
    console.log(this.user);
  }

  ngOnInit(): void {
    this.user = this.userService.getUser();

    this.dashboardService
      .getLinks()
      .subscribe((result: Link[]) => (this.links = result));
  }

  deleteLink(id: any): void {
    const link = this.links.findIndex((link) => link.id === id);
    this.links.splice(link, 1);
  }
}
