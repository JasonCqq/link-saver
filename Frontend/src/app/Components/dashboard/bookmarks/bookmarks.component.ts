import { Component, OnInit } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Link } from "../../../Interfaces/Link";

@Component({
  selector: "app-bookmarks",
  templateUrl: "./bookmarks.component.html",
  styleUrls: ["./bookmarks.component.scss"],
})
export class BookmarksComponent implements OnInit {
  constructor(private dashboardService: DashboardService) {}

  bookmarks: Link[] = [];

  ngOnInit(): void {
    this.getBookmarks();

    this.dashboardService.bookmarkUpdated().subscribe(() => {
      this.getBookmarks();
    });
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
    this.dashboardService.getBookmarks().subscribe((result) => {
      this.bookmarks = result;
    });
  }
}
