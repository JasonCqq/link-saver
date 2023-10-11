import { Component, OnInit } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Folder } from "src/app/Interfaces/Folder";

@Component({
  selector: "app-folders",
  templateUrl: "./folders.component.html",
  styleUrls: ["./folders.component.scss"],
})
export class FoldersComponent implements OnInit {
  constructor(private dashboardService: DashboardService) {}

  folders: Folder[] = [];

  ngOnInit(): void {
    this.getFolders();
    console.log(this.folders);
  }

  getFolders(): void {
    this.dashboardService.getFolders().subscribe((result) => {
      this.folders = result;
    });
  }
}
