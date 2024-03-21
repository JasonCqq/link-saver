import { Component, OnDestroy, OnInit } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Link } from "../../../Interfaces/Link";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(private dashboardService: DashboardService) {}

  private destroy$ = new Subject<void>();
  links: Link[] = [];

  ngOnInit(): void {
    this.getLinks();

    this.dashboardService
      .linksUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getLinks();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Displays search results
  displayResults(results: Link[]): void {
    this.links = results;
  }

  getLinks(): void {
    this.dashboardService
      .getLinks()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => (this.links = result));
  }

  // Moves link
  deleteLink(id: any): void {
    const link = this.links.findIndex((link) => link.id === id);
    this.links.splice(link, 1);
  }
}
