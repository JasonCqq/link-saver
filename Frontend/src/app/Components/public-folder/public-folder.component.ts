import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PublicFolderService } from "./public-folder.service";
import { Link } from "src/app/Interfaces/Link";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "app-public-folder",
  templateUrl: "./public-folder.component.html",
  styleUrls: ["./public-folder.component.scss"],
})
export class PublicFolderComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private service: PublicFolderService,
  ) {}

  previews: boolean = true;
  author: any;
  folderName: any;
  links: Link[] = [];

  passwordLocked: boolean = false;

  passwordForm = new FormGroup({
    password: new FormControl(),
  });

  ngOnInit(): void {
    this.service.getPublicFolder(this.route.snapshot.params["id"]).subscribe({
      next: (res) => {
        this.author = res.authorName;
        this.folderName = res.folderName;
        this.links = res.links;
      },
      error: (err) => {
        if (err.status === 401) {
          this.passwordLocked = true;
        }
      },
    });
  }

  ngOnDestroy(): void {}

  formErrors: any;
  authorizeFolder(): void {
    this.service
      .authorizeFolder(
        this.route.snapshot.params["id"],
        this.passwordForm.value.password,
      )
      .subscribe({
        next: (res) => {
          this.author = res.authorName;
          this.folderName = res.folderName;
          this.links = res.links;
          this.passwordLocked = false;
        },
        error: (error) => {
          this.formErrors = error.error;
        },
      });
  }

  toggleThumbnail() {
    this.previews = !this.previews;
  }
}
