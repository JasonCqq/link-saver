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
import { FoldersService } from "../../folders/folders.service";
import { TempRenderService } from "../../main-dashboard/tempRender.service";

@Component({
  selector: "app-link-edit-form",
  templateUrl: "./link-edit-form.component.html",
  styleUrls: ["./link-edit-form.component.scss"],
})
export class LinkEditFormComponent implements OnInit, OnDestroy {
  constructor(
    private linkService: LinkService,
    private dashboardService: DashboardService,
    private foldersService: FoldersService,
    private tempRenderService: TempRenderService,
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
      editFolder: this.itemData.folderId ?? "",
      editRemind: this.itemData.remind,
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
    this.linkService
      .editLink(
        this.itemData.id,
        this.editForm.value.editTitle,
        this.editForm.value.editFolder,
        this.editForm.value.editBookmarked,
        this.editForm.value.editRemind,
      )
      .subscribe((res: any) => {
        this.tempRenderService.updateLink(res.link);
        this.foldersService.notifyFolders();
        this.toggleEdit.emit();
      });
  }
}
