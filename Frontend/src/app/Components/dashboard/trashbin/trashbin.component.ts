import { Component, OnDestroy, OnInit } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { Link } from "src/app/Interfaces/Link";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-trashbin",
  templateUrl: "./trashbin.component.html",
  styleUrls: ["./trashbin.component.scss"],
})
export class TrashbinComponent implements OnInit, OnDestroy {
  constructor(private dashboardService: DashboardService) {}

  private destroy$ = new Subject<void>();
  trash: Link[] = [];

  clearPrompt: boolean = false;

  ngOnInit(): void {
    this.getTrash();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePrompt(): void {
    this.clearPrompt = !this.clearPrompt;
  }

  getTrash(): void {
    this.dashboardService
      .getTrash()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.trash = result;
      });
  }

  deleteAllTrash(): void {
    this.dashboardService.deleteAllTrash();
    this.trash = [];
  }

  // Displays search results
  displayResults(results: Link[]): void {
    this.trash = results;
  }

  // Moves link
  deleteLink(id: any): void {
    const link = this.trash.findIndex((link) => link.id === id);
    this.trash.splice(link, 1);
  }
}
