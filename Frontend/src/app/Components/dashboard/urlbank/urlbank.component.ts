import { Component, OnInit, OnDestroy } from "@angular/core";
import { UrlBankService } from "./urlbank.service";
import { FormControl, FormGroup } from "@angular/forms";
import { takeUntil, Subject } from "rxjs";

@Component({
  selector: "app-urlbank",
  templateUrl: "./urlbank.component.html",
  styleUrls: ["./urlbank.component.scss"],
})
export class UrlbankComponent implements OnInit, OnDestroy {
  constructor(private urlBankService: UrlBankService) {}
  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  urls: any;
  ngOnInit(): void {
    this.urlBankService
      .getUrls()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.urls = res;
        console.log(res);
      });
  }

  urlFormPop: boolean = false;
  toggleUrlForm() {
    this.urlFormPop = !this.urlFormPop;

    console.log(this.urls);
  }

  urlForm = new FormGroup({
    urls: new FormControl(""),
  });

  submitUrlForm() {
    //if form isn't empty
    this.urlBankService.submitForm(this.urlForm.value.urls ?? "");
  }
}
