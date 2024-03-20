import { Component, OnInit } from "@angular/core";
import { UserService } from "../../user/user.service";
import { DashboardService } from "../dashboard.service";
import { Link } from "../../../Interfaces/Link";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  // Checks for user
  constructor(private dashboardService: DashboardService) {}

  links: Link[] = [];

  ngOnInit(): void {
    this.getLinks();

    this.dashboardService.linksUpdated().subscribe(() => {
      this.getLinks();
    });
  }

  // Displays search results
  displayResults(results: Link[]): void {
    this.links = results;
  }

  getLinks(): void {
    this.dashboardService
      .getLinks()
      .subscribe((result) => (this.links = result));
  }

  // Moves link
  deleteLink(id: any): void {
    const link = this.links.findIndex((link) => link.id === id);
    this.links.splice(link, 1);
  }
}
