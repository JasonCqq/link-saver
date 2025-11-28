import { Component, OnInit, OnDestroy } from "@angular/core";
import { UrlBankService } from "./urlbank.service";
import { FormControl, FormGroup } from "@angular/forms";
import { takeUntil, Subject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

// Separates URLs in textarea into an array of URLs
function extractUrls(text: string) {
  const urlPattern =
    /\b((https?:\/\/|www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/[^\s]*)?)\b/g;
  const urls = text.match(urlPattern);
  return urls || [];
}

@Component({
    selector: "app-urlbank",
    templateUrl: "./urlbank.component.html",
    styleUrls: ["./urlbank.component.scss"],
    standalone: false
})
export class UrlbankComponent implements OnInit, OnDestroy {
  constructor(
    private urlBankService: UrlBankService,
    public snackBar: MatSnackBar,
  ) {}
  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  urls: any;
  ngOnInit(): void {
    this.getUrls();
  }

  // URL Functions
  copyUrl(url: string) {
    navigator.clipboard.writeText(url);

    this.snackBar.open("Copied to clipboard");
    setTimeout(() => {
      this.snackBar.dismiss();
    }, 1000);
  }

  deleteUrl(id: string) {
    this.urlBankService.deleteUrl(id).subscribe(() => {
      const url = this.urls.findIndex((u: any) => u.id === id);
      this.urls.splice(url, 1);
    });
  }

  deleteAllUrls() {
    this.urlBankService.deleteAllUrls().subscribe(() => {
      this.urls = [];
      this.toggleDelAllPrompt();
    });
  }

  delAllPrompt: boolean = false;
  toggleDelAllPrompt() {
    this.delAllPrompt = !this.delAllPrompt;
  }

  getUrls() {
    this.urlBankService
      .getUrls()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.urls = res;
      });
  }

  // URL Form
  urlFormPop: boolean = false;
  toggleUrlForm() {
    this.urlFormPop = !this.urlFormPop;
  }

  urlForm = new FormGroup({
    urls: new FormControl(""),
  });

  submitUrlForm() {
    const separatedUrls = extractUrls(this.urlForm.value.urls ?? "");

    this.urlBankService.submitForm(separatedUrls).subscribe({
      next: () => {
        this.getUrls();
        this.urlForm.reset();
      },
      error: (error: any) => {
        alert(error.error);
      },
    });
  }
}
