import { Component, Input } from "@angular/core";

@Component({
  selector: "app-main-nav",
  templateUrl: "./main-nav.component.html",
  styleUrls: ["./main-nav.component.scss"],
})
export class MainNavComponent {
  @Input() title: any;

  createForm: boolean = false;
  toggleForm(): void {
    this.createForm = !this.createForm;
  }

  // openAllLinks(): void {

  // }
}
