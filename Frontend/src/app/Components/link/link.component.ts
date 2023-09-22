import { Component, Input } from "@angular/core";
import { LinkService } from "./link.service";

@Component({
  selector: "app-link",
  templateUrl: "./link.component.html",
  styleUrls: ["./link.component.scss"],
})
export class LinkComponent {
  constructor(private linkService: LinkService) {}

  @Input() itemData: any;
}
