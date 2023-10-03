import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { LinkFormService } from "./link-form.service";
import { UserService } from "../../../user/user.service";

@Component({
  selector: "app-link-form",
  templateUrl: "./link-form.component.html",
  styleUrls: ["./link-form.component.scss"],
})
export class LinkFormComponent implements OnInit {
  constructor(
    private linkFormService: LinkFormService,
    private userService: UserService,
  ) {}

  user: any;

  linkForm = new FormGroup({
    title: new FormControl(),
    url: new FormControl(),
    thumbnail: new FormControl(),
    folder: new FormControl(),
    bookmarked: new FormControl(),
    remind: new FormControl(),
  });

  submitForm(): void {
    this.linkFormService.submitLinkForm(
      this.linkForm.value.title ?? "",
      this.linkForm.value.url ?? "",
      this.linkForm.value.thumbnail ?? "",
      this.linkForm.value.folder ?? "",
      this.linkForm.value.bookmarked ?? false,
      this.linkForm.value.remind ?? null,
    );
  }

  ngOnInit(): void {
    this.linkForm.valueChanges.subscribe();
    this.user = this.userService.getUser();
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
  get bookmarked() {
    return this.linkForm.get("bookmark");
  }
  get remind() {
    return this.linkForm.get("remind");
  }
}
