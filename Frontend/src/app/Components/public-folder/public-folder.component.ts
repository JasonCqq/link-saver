import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PublicFolderService } from "./public-folder.service";
import { Link } from "src/app/Interfaces/Link";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "app-public-folder",
  templateUrl: "./public-folder.component.html",
  styleUrls: ["./public-folder.component.scss"],
  standalone: false,
})
export class PublicFolderComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private service: PublicFolderService
  ) {}

  currentSort: string = "date";
  author: any;
  folderName: any;
  links: Link[] = [];

  ngOnInit(): void {
    this.service.getPublicFolder(this.route.snapshot.params["id"]).subscribe({
      next: (res) => {
        this.author = res.authorName;
        this.folderName = res.folderName;
        this.links = res.links;

        this.sort(this.currentSort);
      },
      error: (err) => {
        if (err.status === 401) {
          this.passwordLocked = true;
        }
      },
    });
  }

  ngOnDestroy(): void {}

  passwordLocked: boolean = false;
  passwordForm = new FormGroup({
    password: new FormControl(),
  });

  formErrors: any;
  authorizeFolder(): void {
    this.service
      .authorizeFolder(
        this.route.snapshot.params["id"],
        this.passwordForm.value.password
      )
      .subscribe({
        next: (res) => {
          this.passwordLocked = false;
          this.author = res.authorName;
          this.folderName = res.folderName;
          this.links = res.links;
        },
        error: (error) => {
          this.formErrors = error.error;
        },
      });
  }

  sort(input: string) {
    if (input === "name") {
      this.links?.sort((a, b) => a.title.localeCompare(b.title));
      this.currentSort = "name";
    } else if (input === "date") {
      this.links?.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      this.currentSort = "date";
    }
  }
}
