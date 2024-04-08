import { Component, Host, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Link } from "../../../Interfaces/Link";
import { Subject, takeUntil } from "rxjs";
import { MainNavService } from "../main-nav/main-nav.service";
import { LinkService } from "../links/link-item/link-item.service";
import { fadeIn, fadeOut } from "src/app/app.component";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  animations: [fadeIn, fadeOut],
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(
    private dashboardService: DashboardService,
    private mainNavService: MainNavService,
    private linkService: LinkService,
  ) {}

  private destroy$ = new Subject<void>();
  links: Link[] = [];
  tempLinks: Link[] | null = null;
  tempTitle: string = "";

  previews: any;

  clearPrompt: boolean = false;
  togglePrompt(): void {
    this.clearPrompt = !this.clearPrompt;
  }
  deleteAllTrash(): void {
    this.dashboardService.deleteAllTrash();
  }

  ngOnInit(): void {
    this.getLinks();

    this.dashboardService
      .linksUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getLinks();
      });

    this.mainNavService.title$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.showOnly(res);
        this.tempTitle = res;
      });

    this.linkService.thumbnails$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.previews = state;
      });
  }

  showOnly(linkType: string): void {
    if (linkType === "Dashboard") {
      this.tempLinks = null;
    } else if (linkType === "Bookmarks") {
      this.tempLinks = this.links.filter((link) => link.bookmarked);
    } else if (linkType === "Upcoming") {
      this.tempLinks = this.links.filter((link) => link.remind);
    } else if (linkType === "Trash") {
      this.tempLinks = this.links.filter((link) => link.trash);
    }
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
      .subscribe((result) => {
        this.links = result;
        this.tempLinks = null;
        this.showOnly(this.mainNavService.getTitle());
      });
  }

  // Moves link
  deleteLink(id: any): void {
    const link = this.links.findIndex((link) => link.id === id);
    this.links.splice(link, 1);
  }
}
