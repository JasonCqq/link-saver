import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: "app-web-view",
  templateUrl: "./web-view.component.html",
  styleUrl: "./web-view.component.scss",
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class WebViewComponent implements OnInit, AfterViewInit {
  constructor(private sanitizer: DomSanitizer) {}

  @ViewChild("container") container: ElementRef<HTMLDivElement> | null = null;
  @Input() htmlData: any;

  sanitizedHtml: SafeHtml = "";

  ngOnInit(): void {
    this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(this.htmlData);
  }

  async ngAfterViewInit() {
    const shadow = this.container?.nativeElement.attachShadow({ mode: "open" });

    // Add a wrapper div inside shadow DOM
    if (shadow) {
      shadow.innerHTML = `
      <div class="shadow-content">${this.sanitizedHtml}</div>
    `;
    }
  }
}
