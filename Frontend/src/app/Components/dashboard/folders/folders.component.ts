import { Component, OnInit } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Folder } from "src/app/Interfaces/Folder";
import { FoldersService } from "./folders.service";
import { FormGroup, FormControl } from "@angular/forms";

@Component({
  selector: "app-folders",
  templateUrl: "./folders.component.html",
  styleUrls: ["./folders.component.scss"],
})
export class FoldersComponent implements OnInit {
  constructor(
    private dashboardService: DashboardService,
    private foldersService: FoldersService,
  ) {}

  folders: Folder[] = [];
  folderOpened: boolean = false;
  createWindowOpened: boolean = false;
  tempLinks: any = [];

  ngOnInit(): void {
    this.getFolders();

    this.foldersService.foldersUpdated().subscribe(() => {
      this.getFolders();
    });
  }

  createFolderForm = new FormGroup({
    folderName: new FormControl(),
  });

  toggleCreateWindow(): void {
    this.createWindowOpened = !this.createWindowOpened;
  }

  createFolder(): void {
    if (this.createFolderForm.value.folderName.length > 0) {
      this.foldersService.createFolder(this.createFolderForm.value.folderName);

      this.toggleCreateWindow();
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
    this.dashboardService.getFolders().subscribe((result) => {
      this.folders = result;
    });
  }
}
