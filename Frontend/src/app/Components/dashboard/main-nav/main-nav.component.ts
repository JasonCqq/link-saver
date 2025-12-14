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

interface sortBy {
  name: string;
  value: string;
}

@Component({
  selector: "app-main-nav",
  templateUrl: "./main-nav.component.html",
  styleUrls: ["./main-nav.component.scss"],
  standalone: false,
})
export class MainNavComponent implements OnInit, OnDestroy {
  previews: any;

  massEditting: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private linkService: LinkService,
    private mainNavService: MainNavService
  ) {}

  private destroy$ = new Subject<void>();

  sort: sortBy[] | undefined;
  ngOnInit(): void {
    // Select Menu
    this.sort = [
      { name: "Visits", value: "Visits" },
      { name: "Latest", value: "Latest" },
      { name: "Oldest", value: "Oldest" },
      { name: "Name A-Z", value: "Nameup" },
      { name: "Name Z-A", value: "Namedown" },
    ];
    // this.sortingForm.get("sortBy")?.valueChanges.subscribe(() => {
    //   this.submitSortingForm();
    // });

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

    this.mainNavService.massEdit$.subscribe((bool) => {
      this.massEditting = bool;
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

  query = new FormGroup({
    linkQuery: new FormControl(),
  });

  sortingForm = new FormGroup({
    sortBy: new FormControl(),
  });

  submitSortingForm(value: string) {
    this.sortByResults.emit(value);
    this.mainNavService.submitSortBy(value);
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

  toggleMassEdit(): void {
    this.mainNavService.toggleMassEdit();
  }
  massEditForm: boolean = false;
}
