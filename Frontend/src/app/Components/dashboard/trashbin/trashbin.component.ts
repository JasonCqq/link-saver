import { Component, OnInit } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Link } from "src/app/Interfaces/Link";

@Component({
  selector: "app-trashbin",
  templateUrl: "./trashbin.component.html",
  styleUrls: ["./trashbin.component.scss"],
})
export class TrashbinComponent implements OnInit {
  constructor(private dashboardService: DashboardService) {}
  trash: Link[] = [];

  ngOnInit(): void {
    this.getTrash();
  }

  getTrash(): void {
    this.dashboardService.getTrash().subscribe((result) => {
      this.trash = result;
    });
  }

  deleteLink(id: any): void {
    const link = this.trash.findIndex((link) => link.id === id);
    this.trash.splice(link, 1);
  }
}
