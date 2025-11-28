import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Folder } from "src/app/Interfaces/Folder";
import { FoldersService } from "./folders.service";
import { FormGroup, FormControl } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { Link } from "src/app/Interfaces/Link";
import { MainNavService } from "../main-nav/main-nav.service";
import { LinkService } from "../links/link-item/link-item.service";
import { ChangeDetectionStrategy } from "@angular/core";
import { LoadingService } from "../../LoadingInterceptor.service";

interface shareUrl {
  url: string;
}

@Component({
    selector: "app-folders",
    templateUrl: "./folders.component.html",
    styleUrls: ["./folders.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FoldersComponent implements OnInit, OnDestroy {
  constructor(
    private dashboardService: DashboardService,
    private foldersService: FoldersService,
    private mainNavService: MainNavService,
    private linkService: LinkService,
    public loadingService: LoadingService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  private destroy$ = new Subject<void>();

  folders: Folder[] = [];
  folderOpened: boolean = false;

  windowOpened: boolean = false;
  editWindowOpened: boolean = false;
  shareWindowOpened: boolean = false;

  tempId: any;
  tempLinks: any = [];
  tempShare: any;
  previews: any;
  tempShareUrl: any;

  updateTempLinks(folderId: string) {
    const folderIndex = this.folders.findIndex((folder) => {
      return folder.id === folderId;
    });

    this.tempLinks = this.folders[folderIndex].links;
    this.changeDetector.detectChanges();
  }

  ngOnInit(): void {
    this.getFolders();

    this.mainNavService.changeTitle("Folders");

    this.foldersService
      .foldersUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getFolders();
      });

    this.linkService.thumbnails$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.previews = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createFolderForm = new FormGroup({
    folderName: new FormControl(),
    editFolderName: new FormControl(),
  });

  shareFolderForm = new FormGroup({
    passwordToggle: new FormControl(false),
    password: new FormControl({ value: "", disabled: true }),
  });

  togglePasswordInput() {
    if (this.shareFolderForm.get("passwordToggle")?.value) {
      this.shareFolderForm.get("password")?.enable();
    } else {
      this.shareFolderForm.get("password")?.disable();
    }
  }

  toggleWindow(): void {
    this.windowOpened = !this.windowOpened;
  }

  createFolder(): void {
    if (this.createFolderForm.value.folderName.length > 0) {
      this.foldersService.createFolder(this.createFolderForm.value.folderName);
      this.toggleWindow();
      this.createFolderForm.patchValue({
        folderName: "",
      });
    }
    return;
  }

  openFolder(folderID: string): void {
    this.folderOpened = !this.folderOpened;

    const folderIndex = this.folders.findIndex((folder) => {
      return folder.id === folderID;
    });

    this.tempLinks = this.folders[folderIndex].links;
    this.sortResults(this.mainNavService.getSortBy());

    this.tempId = this.folders[folderIndex].id;
    this.tempShare = this.folders[folderIndex].private;
  }

  closeFolder(): void {
    this.folderOpened = !this.folderOpened;
    this.tempLinks = null;
    this.tempId = null;
    this.tempShare = true;
    this.shareFolderForm.reset();
    this.tempShareUrl = null;
  }

  getFolders() {
    this.dashboardService
      .getFolders()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.folders = result;

        if (this.folderOpened && this.tempId) {
          this.updateTempLinks(this.tempId);
        }
      });
  }

  shareFolder() {
    if (this.tempLinks.length === 0) {
      alert("Folder has no links, please add some before sharing");
      return;
    }

    this.foldersService
      .shareFolder(this.shareFolderForm.value.password || "", true, this.tempId)
      .subscribe((res) => {
        const response = res as shareUrl;
        this.tempShareUrl = response.url;
        this.tempShare = false;
        this.changeDetector.detectChanges();
      });
  }

  unshareFolder() {
    this.foldersService
      .unshareFolder(this.tempId, !this.tempShare)
      .subscribe(() => {
        this.tempShare = !this.tempShare;
        this.changeDetector.detectChanges();
      });
  }

  toggleShareWindow(): void {
    this.shareWindowOpened = !this.shareWindowOpened;
  }

  tempEditID: string = "";

  toggleEditWindow(id: string): void {
    if (id === "none") {
      this.editWindowOpened = !this.editWindowOpened;
    } else {
      this.editWindowOpened = !this.editWindowOpened;

      const folderIndex = this.folders.findIndex((folder) => {
        return folder.id === id;
      });

      const folderName = this.folders[folderIndex].name;
      this.createFolderForm.patchValue({
        editFolderName: folderName,
      });

      this.tempEditID = id;
    }
  }

  editFolder(): void {
    if (this.tempEditID) {
      this.foldersService.editFolder(
        this.tempEditID,
        this.createFolderForm.value.editFolderName,
      );
    }

    this.toggleEditWindow("none");
  }

  deleteFolder(id: string): void {
    this.foldersService.deleteFolder(id);
  }

  // Moves link
  deleteLink(id: any): void {
    const link = this.tempLinks.findIndex((link: any) => link.id === id);
    this.tempLinks.splice(link, 1);
  }

  // displayResults & sortResults are temporary
  // Make as reusable functions.

  // Displays search results
  displayResults(results: Link[]): void {
    this.tempLinks = results;
    this.sortResults(this.mainNavService.getSortBy());
  }

  sortResults(sort: string): void {
    switch (sort) {
      case "Visits":
        this.tempLinks?.sort((a: any, b: any) => {
          return b.visits - a.visits;
        });
        break;

      case "Latest":
        this.tempLinks?.sort((a: any, b: any) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        break;

      case "Oldest":
        this.tempLinks?.sort((a: any, b: any) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        break;

      case "Nameup":
        this.tempLinks?.sort((a: any, b: any) =>
          a.title.localeCompare(b.title),
        );
        break;

      case "Namedown":
        this.tempLinks?.sort((a: any, b: any) =>
          b.title.localeCompare(a.title),
        );
        break;
    }
  }
}
