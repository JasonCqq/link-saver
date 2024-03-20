import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { LinkService } from "./link-item.service";
import { Link } from "src/app/Interfaces/Link";
import { FormControl, FormGroup } from "@angular/forms";
import { DashboardService } from "../../dashboard.service";
import { UserService } from "src/app/Components/user/user.service";

@Component({
  selector: "app-link-item",
  templateUrl: "./link-item.component.html",
  styleUrls: ["./link-item.component.scss"],
})
export class LinkComponent implements OnInit {
  constructor(
    private linkService: LinkService,
    private dashboardService: DashboardService,
    private userService: UserService,
  ) {}

  @Input() itemData: any;
  @Input() specialRequest: string = "none";
  @Output() linkUpdate = new EventEmitter<Link>();

  editting: boolean = false;
  folders: any;
  previews: any;

  toggleEdit(): void {
    this.editting = !this.editting;
  }

  editForm = new FormGroup({
    editTitle: new FormControl(),
    editFolder: new FormControl(),
    editBookmarked: new FormControl(),
    editRemind: new FormControl(),
  });

  // This is causing many folder requests
  ngOnInit(): void {
    this.dashboardService.getFolders().subscribe((result) => {
      this.folders = result;
    });

    this.linkService.thumbnails$.subscribe((state) => {
      this.previews = state;
    });

    this.editForm.patchValue({
      editTitle: this.itemData.title,
      editBookmarked: this.itemData.bookmarked,
      editFolder: this.itemData.folderId,
    });
  }

  submitEditForm(): void {
    this.linkService.editLink(
      this.itemData.id,
      this.editForm.value.editTitle,
      this.editForm.value.editFolder,
      this.editForm.value.editBookmarked,
      this.editForm.value.editRemind,
    );

    this.toggleEdit();
    this.linkUpdate.emit(this.itemData.id);
  }

  moveToTrash(): void {
    this.linkService.moveToTrash(this.itemData.id);
    this.linkUpdate.emit(this.itemData.id);
  }

  permanentDelete(): void {
    this.linkService.permanentDelete(this.itemData.id);
    this.linkUpdate.emit(this.itemData.id);
  }

  restoreLink(): void {
    this.linkService.restoreLink(this.itemData.id);
    this.linkUpdate.emit(this.itemData.id);
  }
}
