import { Component, OnInit, OnDestroy } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Folder } from "src/app/Interfaces/Folder";
import { FoldersService } from "./folders.service";
import { FormGroup, FormControl } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-folders",
  templateUrl: "./folders.component.html",
  styleUrls: ["./folders.component.scss"],
})
export class FoldersComponent implements OnInit, OnDestroy {
  constructor(
    private dashboardService: DashboardService,
    private foldersService: FoldersService,
  ) {}

  private destroy$ = new Subject<void>();

  folders: Folder[] = [];
  folderOpened: boolean = false;
  windowOpened: boolean = false;
  editWindowOpened: boolean = false;
  tempLinks: any = [];

  ngOnInit(): void {
    this.getFolders();

    this.foldersService
      .foldersUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getFolders();
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

  toggleWindow(): void {
    this.windowOpened = !this.windowOpened;
  }

  createFolder(): void {
    if (this.createFolderForm.value.folderName.length > 0) {
      this.foldersService.createFolder(this.createFolderForm.value.folderName);

      this.toggleWindow();
    }
    return;
  }

  openFolder(folderID: string): void {
    this.folderOpened = !this.folderOpened;

    const folderIndex = this.folders.findIndex((folder) => {
      return folder.id === folderID;
    });

    this.tempLinks = this.folders[folderIndex].links;
  }

  closeFolder(): void {
    this.folderOpened = !this.folderOpened;
    this.tempLinks = [];
  }

  getFolders(): void {
    this.dashboardService
      .getFolders()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.folders = result;
      });
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
}
