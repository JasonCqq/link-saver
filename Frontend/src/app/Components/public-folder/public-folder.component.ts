import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PublicFolderService } from "./public-folder.service";
import { Link } from "src/app/Interfaces/Link";
import { Subject, takeUntil } from "rxjs";

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

  private destroy$ = new Subject<void>();

  author: any;
  folderName: any;
  links: Link[] = [];

  ngOnInit(): void {
    this.service
      .getPublicFolder(this.route.snapshot.params["id"])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.author = res.authorName;
        this.folderName = res.folderName;
        this.links = res.links;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
