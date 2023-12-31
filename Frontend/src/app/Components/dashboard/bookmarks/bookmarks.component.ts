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
  }

  getBookmarks(): void {
    this.dashboardService.getBookmarks().subscribe((result) => {
      this.bookmarks = result;
    });
  }
}
