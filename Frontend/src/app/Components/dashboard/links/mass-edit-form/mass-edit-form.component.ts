import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Input,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { DashboardService } from "../../dashboard.service";
import { Subject, takeUntil } from "rxjs";
import { MainNavService } from "../../main-nav/main-nav.service";
import { FoldersService } from "../../folders/folders.service";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-mass-edit-form",
  templateUrl: "./mass-edit-form.component.html",
  standalone: false,
})
export class MassEditFormComponent implements OnInit, OnDestroy {
  constructor(
    private dashboardService: DashboardService,
    private mainNavService: MainNavService,
    private foldersService: FoldersService,
    private messageService: MessageService
  ) {}

  title: any;
  folders: any;

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() massEditting = new EventEmitter();

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.dashboardService
      .getFolders()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.folders = res;
      });

    this.mainNavService.title$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.title = res;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  massEditForm = new FormGroup({
    massTitle: new FormControl(),
    massFolder: new FormControl(),
    massBookmark: new FormControl(),
  });

  submitMassEditForm() {
    this.mainNavService
      .submitMassEdit(
        this.massEditForm.value.massTitle,
        this.massEditForm.value.massFolder,
        this.massEditForm.value.massBookmark
      )
      .subscribe(() => {
        this.title === "Folders"
          ? this.foldersService.notifyFolders()
          : this.dashboardService.notify();

        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Mass link edits applied",
          life: 3000,
        });

        this.visibleChange.emit(false);
        this.massEditting.emit();
      });
  }

  submitMassResDelForm(order: string) {
    let del: boolean = false;
    let res: boolean = false;

    if (order === "delete") {
      del = true;
      res = false;
    } else if (order === "restore") {
      del = false;
      res = true;
    }

    this.mainNavService.submitMassResDel(del, res).subscribe(() => {
      this.title === "Folders"
        ? this.foldersService.notifyFolders()
        : this.dashboardService.notify();

      this.messageService.add({
        severity: "success",
        summary: "Success",
        detail: "Links all restored/deleted",
        life: 3000,
      });

      this.visibleChange.emit(false);
      this.massEditting.emit();
    });
  }
}
