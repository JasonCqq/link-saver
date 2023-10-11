import { Component, Input } from "@angular/core";
import { LinkService } from "./link-item.service";

@Component({
  selector: "app-link-item",
  templateUrl: "./link-item.component.html",
  styleUrls: ["./link-item.component.scss"],
})
export class LinkComponent {
  constructor(private linkService: LinkService) {}

  @Input() itemData: any;

  moveToTrash(): void {
    this.linkService.moveToTrash(this.itemData.id);
  }
}
