import { Component, OnInit, OnDestroy } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Link } from "../../../Interfaces/Link";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-bookmarks",
  templateUrl: "./bookmarks.component.html",
  styleUrls: ["./bookmarks.component.scss"],
})
export class BookmarksComponent implements OnInit, OnDestroy {
  constructor(private dashboardService: DashboardService) {}

  private destroy$ = new Subject<void>();
  bookmarks: Link[] = [];

  ngOnInit(): void {
    this.getBookmarks();

    this.dashboardService
      .bookmarkUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getBookmarks();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Moves link
  deleteLink(id: any): void {
    const link = this.bookmarks.findIndex((link) => link.id === id);
    this.bookmarks.splice(link, 1);
  }

  // Display search results
  displayResults(results: Link[]): void {
    this.bookmarks = results;
  }

  getBookmarks(): void {
    this.dashboardService
      .getBookmarks()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.bookmarks = result;
      });
  }
}
