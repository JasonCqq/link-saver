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

  ngOnInit(): void {
    this.user = this.userService.getUser();

    this.getLinks();

    this.dashboardService.linksUpdated().subscribe(() => {
      this.getLinks();
    });
  }

  temp(): void {
    console.log(this.user);
  }

  getLinks(): void {
    this.dashboardService
      .getLinks()
      .subscribe((result) => (this.links = result));
  }

  deleteLink(id: any): void {
    const link = this.links.findIndex((link) => link.id === id);
    this.links.splice(link, 1);
  }
}
