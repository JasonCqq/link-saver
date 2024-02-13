import { Component, OnInit } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Link } from "src/app/Interfaces/Link";

@Component({
  selector: "app-upcoming",
  templateUrl: "./upcoming.component.html",
  styleUrls: ["./upcoming.component.scss"],
})
export class UpcomingComponent implements OnInit {
  constructor(private dashboardService: DashboardService) {}
  upcoming: Link[] = [];

  ngOnInit(): void {
    this.getUpcoming();

    this.dashboardService.upcomingUpdated().subscribe(() => {
      this.getUpcoming();
    });
  }

  deleteLink(id: any): void {
    const link = this.upcoming.findIndex((link) => link.id === id);
    this.upcoming.splice(link, 1);
  }

  displayResults(results: Link[]): void {
    this.upcoming = results;
  }

  getUpcoming(): void {
    this.dashboardService.getUpcoming().subscribe((result) => {
      this.upcoming = result;
    });
  }
}
