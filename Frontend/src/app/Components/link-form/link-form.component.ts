import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { LinkFormService } from "./link-form.service";

@Component({
  selector: "app-link-form",
  templateUrl: "./link-form.component.html",
  styleUrls: ["./link-form.component.scss"],
})
export class LinkFormComponent {
  constructor(private linkFormService: LinkFormService) {}

  linkForm = new FormGroup({
    title: new FormControl(""),
    url: new FormControl(""),
    thumbnail: new FormControl(""),
    folder: new FormControl(""),
    bookmark: new FormControl(),
    reminder: new FormControl(),
  });

  submitForm(): void {
    // const currentDate = new Date();

    this.linkFormService.submitLinkForm(
      this.linkForm.value.title ?? "",
      this.linkForm.value.url ?? "",
      this.linkForm.value.thumbnail ?? "",
      this.linkForm.value.folder ?? "",
      this.linkForm.value.bookmark ?? false,
      this.linkForm.value.reminder,
    );
  }

  ngOnInit(): void {
    this.linkForm.valueChanges.subscribe();
  }

  get title() {
    return this.linkForm.get("title");
  }

  get url() {
    return this.linkForm.get("url");
  }

  get thumbnail() {
    return this.linkForm.get("thumbnail");
  }

  get folder() {
    return this.linkForm.get("folder");
  }

  get bookmark() {
    return this.linkForm.get("bookmark");
  }

  get reminder() {
    return this.linkForm.get("reminder");
  }
}
