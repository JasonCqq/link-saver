import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
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
  standalone: false,
})
export class LinkComponent implements OnInit, OnDestroy {
  constructor(
    private linkService: LinkService,
    private mainNavService: MainNavService,
    private elementRef: ElementRef
  ) {}

  @Input() itemData: any;
  @Output() linkUpdate = new EventEmitter<Link>();
  @Output() linkPermDelete = new EventEmitter<Link>();

  private destroy$ = new Subject<void>();

  previews: any;
  editForm: boolean = false;
  massEditting: boolean = false;
  specialRequest: string = "none";

  // For embed player
  @Output() showEmbed = new EventEmitter<Link>();
  setShowEmbed() {
    this.showEmbed.emit(this.itemData);
  }

  @Output() showWebPreview = new EventEmitter<Link>();
  setShowWebView() {
    this.showWebPreview.emit(this.itemData);
  }

  // For image expansion
  expand: boolean = false;
  // expandImg(){
  //   this.expand = true;
  // }

  // For mobile menu hover
  @Input() index!: number;
  @Input() isOptionsVisible: boolean = false;
  @Output() showOptionsChange = new EventEmitter<number | null>();

  onMouseEnter() {
    this.showOptionsChange.emit(this.index);
  }

  onMouseLeave() {
    this.showOptionsChange.emit(null);
  }

  // For mobile menu hover
  showLinkOptions: boolean = false;
  toggleLinkOptions(event: TouchEvent) {
    event.stopPropagation();
    this.showOptionsChange.emit(this.isOptionsVisible ? null : this.index);
  }

  // For mobile menu hover
  @HostListener("document:touchstart", ["$event"])
  onDocumentTouch(event: TouchEvent) {
    if (
      this.isOptionsVisible &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.showOptionsChange.emit(null);
    }
  }

  addingID: boolean = false;
  addMassID(id: string) {
    if (this.massEditting === true) {
      this.mainNavService.addMassID(id);
      this.addingID = !this.addingID;
    } else {
      return;
    }
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

    this.mainNavService.massEdit$
      .pipe(takeUntil(this.destroy$))
      .subscribe((bool) => {
        this.massEditting = bool;

        if (bool === false) {
          const itemBorder = document.querySelector(
            ".link-item"
          ) as HTMLElement;
          itemBorder.classList.remove(".link-item-border");
          this.addingID = false;
        }
      });
  }

  visitedLink() {
    this.linkService.visitedLink(this.itemData.id);
    // Temporary render
    this.itemData.visits++;
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
    this.linkService
      .permanentDelete(this.itemData.id)
      .subscribe(() => this.linkPermDelete.emit(this.itemData.id));
  }

  restoreLink(): void {
    this.linkService.restoreLink(this.itemData.id);
    this.linkUpdate.emit(this.itemData.id);
  }
}
