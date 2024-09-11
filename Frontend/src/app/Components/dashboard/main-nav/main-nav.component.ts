import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { DashboardService } from "../dashboard.service";
import { Link } from "src/app/Interfaces/Link";
import { Subject, debounceTime, takeUntil } from "rxjs";
import { LinkService } from "../links/link-item/link-item.service";
import { MainNavService } from "./main-nav.service";

@Component({
  selector: "app-main-nav",
  templateUrl: "./main-nav.component.html",
  styleUrls: ["./main-nav.component.scss"],
})
export class MainNavComponent implements OnInit, OnDestroy {
  previews: any;

  constructor(
    private dashboardService: DashboardService,
    private linkService: LinkService,
    private mainNavService: MainNavService,
  ) {}

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.query.valueChanges
      .pipe(debounceTime(1000), takeUntil(this.destroy$))
      .subscribe(() => this.searchLinks());

    this.linkService.thumbnails$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.previews = state;
      });

    this.mainNavService.title$
      .pipe(takeUntil(this.destroy$))
      .subscribe((title) => {
        this.title = title;
      });

    this.mainNavService.getSortByValue();
    this.mainNavService.sortBy$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.sortBy = result;

        this.sortingForm.setValue({
          sortBy: result,
        });

        this.sortByResults.emit(result);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sortBy: string = "";
  title: string = "";
  @Input() folderId: any;
  @Output() searchResults: EventEmitter<Link[]> = new EventEmitter<Link[]>();
  @Output() sortByResults: EventEmitter<string> = new EventEmitter<string>();

  createForm: boolean = false;
  toggleForm(): void {
    this.createForm = !this.createForm;
  }

  query = new FormGroup({
    linkQuery: new FormControl(),
  });

  sortingForm = new FormGroup({
    sortBy: new FormControl(),
  });

  submitSortingForm() {
    this.sortByResults.emit(this.sortingForm.value.sortBy);
    this.mainNavService.submitSortBy(this.sortingForm.value.sortBy);
  }

  searchLinks(): void {
    if (this.title === "Folders" && this.folderId) {
      this.dashboardService
        .searchLinkInFolder(this.query.value.linkQuery || "", this.folderId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          this.searchResults.emit(result);
        });
    } else if (this.title !== "Folders") {
      this.dashboardService
        .searchLink(this.query.value.linkQuery || "", this.title)
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          this.searchResults.emit(result);
        });
    }
  }
}
