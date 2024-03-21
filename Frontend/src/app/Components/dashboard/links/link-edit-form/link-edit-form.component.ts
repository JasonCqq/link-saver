import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { LinkService } from "../link-item/link-item.service";
import { DashboardService } from "../../dashboard.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-link-edit-form",
  templateUrl: "./link-edit-form.component.html",
  styleUrls: ["./link-edit-form.component.scss"],
})
export class LinkEditFormComponent implements OnInit, OnDestroy {
  constructor(
    private linkService: LinkService,
    private dashboardService: DashboardService,
  ) {}

  private destroy$ = new Subject<void>();

  @Input() itemData: any;
  @Output() toggleEdit: EventEmitter<any> = new EventEmitter();
  folders: any;

  ngOnInit(): void {
    this.dashboardService
      .getFolders()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.folders = res;
      });

    this.editForm.patchValue({
      editTitle: this.itemData.title,
      editBookmarked: this.itemData.bookmarked,
      editFolder: this.itemData.folderId,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  editForm = new FormGroup({
    editTitle: new FormControl(),
    editFolder: new FormControl(),
    editBookmarked: new FormControl(),
    editRemind: new FormControl(),
  });

  toggleEditForm(): void {
    this.toggleEdit.emit();
  }

  submitEditForm(): void {
    this.linkService.editLink(
      this.itemData.id,
      this.editForm.value.editTitle,
      this.editForm.value.editFolder,
      this.editForm.value.editBookmarked,
      this.editForm.value.editRemind,
    );

    this.toggleEdit.emit();
  }
}
