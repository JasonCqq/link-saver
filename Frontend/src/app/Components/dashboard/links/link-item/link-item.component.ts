import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LinkService } from "./link-item.service";
import { Link } from "src/app/Interfaces/Link";

@Component({
  selector: "app-link-item",
  templateUrl: "./link-item.component.html",
  styleUrls: ["./link-item.component.scss"],
})
export class LinkComponent {
  constructor(private linkService: LinkService) {}

  @Input() itemData: any;
  @Input() specialRequest: string = "none";
  @Output() linkUpdate = new EventEmitter<Link>();

  moveToTrash(): void {
    this.linkService.moveToTrash(this.itemData.id);
    this.linkUpdate.emit(this.itemData.id);
  }

  permanentDelete(): void {
    this.linkService.permanentDelete(this.itemData.id);
    this.linkUpdate.emit(this.itemData.id);
  }

  restoreLink(): void {}
}
