import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { LinkService } from "./link-item.service";
import { Link } from "src/app/Interfaces/Link";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "app-link-item",
  templateUrl: "./link-item.component.html",
  styleUrls: ["./link-item.component.scss"],
})
export class LinkComponent implements OnInit {
  constructor(private linkService: LinkService) {}

  @Input() itemData: any;
  @Input() specialRequest: string = "none";
  @Output() linkUpdate = new EventEmitter<Link>();

  editting: boolean = false;

  toggleEdit(): void {
    this.editting = !this.editting;
  }

  editForm = new FormGroup({
    editTitle: new FormControl(),
    editFolder: new FormControl(),
    editBookmarked: new FormControl(),
    editRemind: new FormControl(),
  });

  ngOnInit(): void {
    this.editForm.patchValue({
      editTitle: this.itemData.title,
      editFolder: this.itemData.folder,
      editBookmarked: this.itemData.bookmarked,
      editRemind: this.itemData.remind,
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
