import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PublicFolderService } from "./public-folder.service";
import { Link } from "src/app/Interfaces/Link";
import { FormControl, FormGroup } from "@angular/forms";

function _arrayBufferToBase64(buffer: any) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

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

        this.links.forEach((link) => {
          if (link.thumbnail.data) {
            link.thumbnail.newUrl = _arrayBufferToBase64(link.thumbnail.data);
          }
        });
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
