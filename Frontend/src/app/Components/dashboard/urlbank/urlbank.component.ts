import { Component } from "@angular/core";

@Component({
  selector: "app-urlbank",
  templateUrl: "./urlbank.component.html",
  styleUrls: ["./urlbank.component.scss"],
})
export class UrlbankComponent {
  urlForm: boolean = false;
  toggleUrlForm() {
    this.urlForm = !this.urlForm;
  }
}
