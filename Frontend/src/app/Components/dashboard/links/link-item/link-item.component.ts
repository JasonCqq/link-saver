import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { LinkService } from "./link-item.service";
import { Link } from "src/app/Interfaces/Link";
import { Subject, takeUntil } from "rxjs";
import { MainNavService } from "../../main-nav/main-nav.service";

@Component({
  selector: "app-link-item",
  templateUrl: "./link-item.component.html",
  styleUrls: ["./link-item.component.scss"],
})
export class LinkComponent implements OnInit, OnDestroy {
  constructor(
    private linkService: LinkService,
    private mainNavService: MainNavService,
  ) {}

  @Input() itemData: any;
  @Output() linkUpdate = new EventEmitter<Link>();

  private destroy$ = new Subject<void>();

  previews: any;
  editting: boolean = false;
  specialRequest: string = "none";

  toggleEdit(): void {
    this.editting = !this.editting;
  }

  ngOnInit(): void {
    this.linkService.thumbnails$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.previews = state;
      });

    this.mainNavService.title$
      .pipe(takeUntil(this.destroy$))
      .subscribe((title) => {
        this.specialRequest = title;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  moveToTrash(): void {
    this.linkService.moveToTrash(this.itemData.id);
    this.linkUpdate.emit(this.itemData.id);
  }

  permanentDelete(): void {
    this.linkService.permanentDelete(this.itemData.id);
    this.linkUpdate.emit(this.itemData.id);
  }

  restoreLink(): void {
    this.linkService.restoreLink(this.itemData.id);
    this.linkUpdate.emit(this.itemData.id);
  }
}
