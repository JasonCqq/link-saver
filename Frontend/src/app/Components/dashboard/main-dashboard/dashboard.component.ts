import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Link } from "../../../Interfaces/Link";
import { Subject, takeUntil } from "rxjs";
import { MainNavService } from "../main-nav/main-nav.service";
import { LinkService } from "../links/link-item/link-item.service";
import { fadeIn, fadeOut } from "src/app/app.component";
import { TempRenderService } from "./tempRender.service";

import { SocketService } from "./socket.service";
import { ConfirmationService, MessageService } from "primeng/api";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  animations: [fadeIn, fadeOut],
  standalone: false,
  providers: [ConfirmationService, MessageService],
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(
    private dashboardService: DashboardService,
    private mainNavService: MainNavService,
    private linkService: LinkService,
    private tempRenderService: TempRenderService,
    // For thumbnail updates
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
    // Primeng
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  socket = this.socketService.getSocket();

  private destroy$ = new Subject<void>();
  links: Link[] = [];
  tempLinks: Link[] | null = null;
  tempTitle: string = "";

  previews: any;

  // For options displaying and working hovering over links
  showLinkOptions: number | null = null;
  setShowLinkOptions(index: number | null) {
    this.showLinkOptions = index;
  }

  // Web View
  showWebPreview: any | null = null;
  hideWebPreview: boolean = true;

  setWebView(link: any) {
    this.closeWebView();
    this.showWebPreview = link;
    setTimeout(() => (this.hideWebPreview = false)); // recreate component
  }
  closeWebView() {
    this.hideWebPreview = true;
  }

  // Embed player
  showEmbedLink: any | null = null;
  hideEmbedLink: boolean = true;

  setEmbed(link: any) {
    this.closeEmbed();
    this.showEmbedLink = null;

    setTimeout(() => (this.showEmbedLink = link)); // recreate component
    this.hideEmbedLink = false;
  }
  closeEmbed() {
    this.hideEmbedLink = true;
  }

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

  ngOnInit(): void {
    this.getLinks();
    this.setupLinksUpdatedSubscription();
    this.setupTitleSubscription();
    this.setupThumbnailSubscription();
    this.setupAddLinkSubscription();
    this.setupEditLinkSubscription();

    this.socket.on("thumbnail-ready", (updatedLink) => {
      const i = this.links.findIndex((link) => link.id === updatedLink.id);

      // Update cached thumbnail
      if (i !== -1) {
        this.links[i].pURL = `${updatedLink.pURL}?t=${Date.now()}`;
        this.cdr.detectChanges();
      }
    });
  }

  // Filter links based on title
  showOnly(linkType: string): void {
    if (linkType === "Dashboard") {
      this.tempLinks = this.links.filter((link) => link.trash === false);
    } else if (linkType === "Bookmarks") {
      this.tempLinks = this.links.filter(
        (link) => link.bookmarked === true && link.trash === false
      );
    } else if (linkType === "Trash") {
      this.tempLinks = this.links.filter((link) => link.trash === true);
    }
    this.sortResults(this.mainNavService.getSortBy());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up socket listener
    const socket = this.socketService.getSocket();
    socket.off("thumbnail-ready");
  }

  // Displays search results
  displayResults(results: Link[]): void {
    this.tempLinks = results;
    this.sortResults(this.mainNavService.getSortBy());
  }

  sortResults(sort: string): void {
    switch (sort) {
      case "Visits":
        this.tempLinks?.sort((a, b) => {
          return b.visits - a.visits;
        });
        break;

      case "Latest":
        this.tempLinks?.sort((a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        break;

      case "Oldest":
        this.tempLinks?.sort((a, b) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        break;

      case "Nameup":
        this.tempLinks?.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case "Namedown":
        this.tempLinks?.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
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

  // Trash delete all confirmation dialog
  confirm1(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: "Are you sure that you want to proceed?",
      header: "Confirmation",
      closable: true,
      closeOnEscape: true,
      icon: "pi pi-exclamation-triangle",
      rejectButtonProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: {
        label: "Save",
      },
      accept: () => {
        this.deleteAllTrash();
        this.messageService.add({
          severity: "info",
          summary: "Confirmed",
          detail: "All links deleted",
        });
      },
      reject: () => {
        this.messageService.add({
          severity: "error",
          summary: "Rejected",
          detail: "Cancelled",
          life: 3000,
        });
      },
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
    this.sortResults(this.mainNavService.getSortBy());
  }

  deletePerm(id: any): void {
    const link = this.links.findIndex((link) => link.id === id);
    this.links.splice(link, 1);
    this.showOnly(this.tempTitle);
    this.sortResults(this.mainNavService.getSortBy());
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
          (link) => link.id === res.id
        );

        if (tempIndex !== undefined && tempIndex !== 1 && this.tempLinks) {
          this.tempLinks[tempIndex] = res;
          this.showOnly(this.tempTitle);
          this.sortResults(this.mainNavService.getSortBy());
        }
      });
  }
}
