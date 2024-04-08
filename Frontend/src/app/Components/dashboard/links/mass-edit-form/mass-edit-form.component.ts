import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { DashboardService } from "../../dashboard.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-mass-edit-form",
  templateUrl: "./mass-edit-form.component.html",
  styleUrls: ["./mass-edit-form.component.scss"],
})
export class MassEditFormComponent implements OnInit, OnDestroy {
  constructor(private dashboardService: DashboardService) {}

  folders: any;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.dashboardService
      .getFolders()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.folders = res;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Output() toggleMassEditForm: EventEmitter<any> = new EventEmitter<any>();

  toggleForm(): void {
    this.toggleMassEditForm.emit();
  }

  massEditForm = new FormGroup({
    massTitle: new FormControl(),
    massRemind: new FormControl(),
    massFolder: new FormControl(),
    massRestore: new FormControl(),
    massDelete: new FormControl(),
    massBookmark: new FormControl(),
  });
}
