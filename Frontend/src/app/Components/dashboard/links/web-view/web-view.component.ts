import {
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
  EventEmitter,
  OnInit,
} from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { LinkService } from "../link-item/link-item.service";

@Component({
  selector: "app-web-view",
  templateUrl: "./web-view.component.html",
  styleUrl: "./web-view.component.scss",
  standalone: false,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class WebViewComponent implements OnInit {
  constructor(
    private sanitizer: DomSanitizer,
    private linkService: LinkService
  ) {}

  @ViewChild("container") container!: ElementRef;
  renderMethod: "iframe" | "shadowdom" | null = null;
  proxyUrl: SafeResourceUrl | null = null;

  @Input() linkData: any;

  @Output() closeWindow = new EventEmitter();
  close() {
    this.closeWindow.emit();
  }

  ngOnInit(): void {
    this.linkService
      .parseLink(this.linkData.id, this.linkData.url)
      .subscribe((response) => {
        this.renderMethod = response.method;

        if (response.method === "iframe") {
          // Store HTML and serve via proxy
          const blob = new Blob([response.content], { type: "text/html" });
          const blobUrl = URL.createObjectURL(blob);
          this.proxyUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);

          console.log("Current display method is iframe");
        } else {
          setTimeout(() => this.renderInShadowDOM(response.content), 0);
          console.log("Current display method is shadowdom");
        }
      });
  }

  renderInShadowDOM(html: string) {
    const container = this.container.nativeElement;
    const shadow =
      container.shadowRoot || container.attachShadow({ mode: "open" });
    shadow.innerHTML = html;

    shadow.querySelectorAll("a").forEach((link: any) => {
      link.addEventListener("click", (e: Event) => e.preventDefault());
    });

    shadow.querySelectorAll("script").forEach((script: any) => {
      script.remove();
    });
  }
}
