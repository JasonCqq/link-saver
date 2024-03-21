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

@Component({
  selector: "app-main-nav",
  templateUrl: "./main-nav.component.html",
  styleUrls: ["./main-nav.component.scss"],
})
export class MainNavComponent implements OnInit, OnDestroy {
  constructor(
    private dashboardService: DashboardService,
    private linkService: LinkService,
  ) {}

  private destroy$ = new Subject<void>();
  previews: any;

  ngOnInit(): void {
    this.query.valueChanges
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => this.searchLinks());

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

  @Input() title: string = "Dashboard";

  @Output() searchResults: EventEmitter<Link[]> = new EventEmitter<Link[]>();

  createForm: boolean = false;
  toggleForm(): void {
    this.createForm = !this.createForm;
  }

  query = new FormGroup({
    linkQuery: new FormControl(),
  });

  searchLinks(): void {
    this.dashboardService
      .searchLink(this.query.value.linkQuery || "", this.title)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.searchResults.emit(result);
      });
    console.log(this.searchResults);
  }

  toggleThumbnail(): void {
    this.linkService.toggleThumbnail();
  }
}
