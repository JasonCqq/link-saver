import { Component } from "@angular/core";


@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent {
  createForm: boolean = false;

  toggleForm(): void {
    this.createForm = !this.createForm;
  }
}
