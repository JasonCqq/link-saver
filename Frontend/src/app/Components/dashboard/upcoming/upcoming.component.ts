import { Component, OnDestroy, OnInit } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Link } from "src/app/Interfaces/Link";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-upcoming",
  templateUrl: "./upcoming.component.html",
  styleUrls: ["./upcoming.component.scss"],
})
export class UpcomingComponent implements OnInit, OnDestroy {
  constructor(private dashboardService: DashboardService) {}

  private destroy$ = new Subject<void>();
  upcoming: Link[] = [];

  ngOnInit(): void {
    this.getUpcoming();

    this.dashboardService
      .upcomingUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getUpcoming();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Moves link
  deleteLink(id: any): void {
    const link = this.upcoming.findIndex((link) => link.id === id);
    this.upcoming.splice(link, 1);
  }

  // Displays search results
  displayResults(results: Link[]): void {
    this.upcoming = results;
  }

  getUpcoming(): void {
    this.dashboardService
      .getUpcoming()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.upcoming = result;
      });
  }
}
