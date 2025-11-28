import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { LinkFormService } from "./link-form.service";
import { DashboardService } from "../../dashboard.service";
import { Subject, takeUntil } from "rxjs";

@Component({
    selector: "app-link-form",
    templateUrl: "./link-form.component.html",
    styleUrls: ["./link-form.component.scss"],
    standalone: false
})
export class LinkFormComponent implements OnInit, OnDestroy {
  constructor(
    private linkFormService: LinkFormService,
    private dashboardService: DashboardService,
  ) {}

  @Output() closeForm = new EventEmitter();

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.linkForm.valueChanges.subscribe();

    this.dashboardService
      .getFolders()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.folders = result;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  linkForm = new FormGroup({
    url: new FormControl("", [Validators.required]),
    folder: new FormControl(),
    bookmarked: new FormControl(),
  });

  submitForm(): void {
    this.linkFormService.submitLinkForm(
      this.linkForm.value.url ?? "",
      this.linkForm.value.folder ?? "",
      this.linkForm.value.bookmarked ?? false,
    );

    this.closeForm.emit();
  }

  folders: any;

  // Getters
  get url() {
    return this.linkForm.get("url");
  }
  get folder() {
    return this.linkForm.get("folder");
  }
  get bookmarked() {
    return this.linkForm.get("bookmark");
  }
}
