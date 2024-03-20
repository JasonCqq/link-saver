import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { LinkFormService } from "./link-form.service";
import { UserService } from "../../../user/user.service";
import { Folder } from "src/app/Interfaces/Folder";
import { DashboardService } from "../../dashboard.service";

@Component({
  selector: "app-link-form",
  templateUrl: "./link-form.component.html",
  styleUrls: ["./link-form.component.scss"],
})
export class LinkFormComponent implements OnInit {
  constructor(
    private linkFormService: LinkFormService,
    private dashboardService: DashboardService,
  ) {}

  @Output() closeForm = new EventEmitter();

  linkForm = new FormGroup({
    url: new FormControl(),
    folder: new FormControl(),
    bookmarked: new FormControl(),
    remind: new FormControl(),
  });

  submitForm(): void {
    this.linkFormService.submitLinkForm(
      this.linkForm.value.url,
      this.linkForm.value.folder ?? "",
      this.linkForm.value.bookmarked ?? false,
      this.linkForm.value.remind ?? null,
    );

    this.closeForm.emit();
  }

  folders: any;
  ngOnInit(): void {
    this.linkForm.valueChanges.subscribe();

    this.dashboardService.getFolders().subscribe((result) => {
      this.folders = result;
    });
  }

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
  get remind() {
    return this.linkForm.get("remind");
  }
}
