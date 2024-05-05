import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Link } from "../../../Interfaces/Link";
import { Subject, takeUntil } from "rxjs";
import { MainNavService } from "../main-nav/main-nav.service";
import { LinkService } from "../links/link-item/link-item.service";
import { fadeIn, fadeOut } from "src/app/app.component";
import { LoadingService } from "../../LoadingInterceptor.service";
import { TempRenderService } from "./tempRender.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  animations: [fadeIn, fadeOut],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(
    private dashboardService: DashboardService,
    private mainNavService: MainNavService,
    private linkService: LinkService,
    public loadingService: LoadingService,
    private tempRenderService: TempRenderService,
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
    this.dashboardService.deleteAllTrash().subscribe(() => {
      this.getLinks();
      this.showOnly("Trash");
    });
  }

  progressSpin: boolean = false;
  ngOnInit(): void {
    this.getLinks();
    this.setupLinksUpdatedSubscription();
    this.setupTitleSubscription();
    this.setupThumbnailSubscription();
    this.setupAddLinkSubscription();
    this.setupEditLinkSubscription();
  }

  private setupLinksUpdatedSubscription(): void {
    this.dashboardService
      .linksUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getLinks();
      });
  }

  private setupTitleSubscription(): void {
    this.mainNavService.title$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.showOnly(res);
        this.tempTitle = res;
      });
  }

  private setupThumbnailSubscription(): void {
    this.linkService.thumbnails$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.previews = state;
      });
  }

  private setupAddLinkSubscription(): void {
    this.tempRenderService.addLink$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.links.unshift(res);
        this.tempLinks?.unshift(res);
      });
  }

  private setupEditLinkSubscription(): void {
    this.tempRenderService.editLink$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        const index = this.links.findIndex((link) => link.id === res.id);
        this.links[index] = res;

        const tempIndex = this.tempLinks?.findIndex(
          (link) => link.id === res.id,
        );
        if (tempIndex && this.tempLinks) {
          this.tempLinks[tempIndex] = res;
        }
      });
  }

  // Filter links based on title
  showOnly(linkType: string): void {
    if (linkType === "Dashboard") {
      this.tempLinks = this.links.filter((link) => link.trash === false);
    } else if (linkType === "Bookmarks") {
      this.tempLinks = this.links.filter((link) => link.bookmarked);
    } else if (linkType === "Upcoming") {
      this.tempLinks = this.links.filter((link) => link.remind);
    } else if (linkType === "Trash") {
      this.tempLinks = this.links.filter((link) => link.trash === true);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Displays search results
  displayResults(results: Link[]): void {
    this.tempLinks = results;
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
  linkEvent(id: any): void {
    const link = this.links.findIndex((link) => link.id === id);

    if (this.tempTitle !== "Trash") {
      this.links[link].trash = true;
    } else if (this.tempTitle === "Trash") {
      this.links[link].trash = false;
    }

    this.showOnly(this.tempTitle);
  }

  deletePerm(id: any): void {
    const link = this.links.findIndex((link) => link.id === id);
    this.links.splice(link, 1);
    this.showOnly(this.tempTitle);
  }
}
