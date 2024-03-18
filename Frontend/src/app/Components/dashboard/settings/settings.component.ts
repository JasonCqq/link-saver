import { Component, OnInit } from "@angular/core";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { UserService } from "../../user/user.service";
import { FormControl, FormGroup } from "@angular/forms";
import { DashboardService } from "../dashboard.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  constructor(
    private userService: UserService,
    private dashboardService: DashboardService,
  ) {}

  user: any;
  userSettings: any;

  ngOnInit(): void {
    this.user = this.userService.getUser();

    if (this.user) {
      this.preferenceForm.patchValue({
        previews: this.user.settings.previews,
        emailNotifications: this.user.settings.emailNotifications,
      });
    }
  }

  preferenceForm = new FormGroup({
    previews: new FormControl(),
    emailNotifications: new FormControl(),
  });

  changesApplied = false;

  submitForm(): void {
    // Add checker to see if value have been altered
    this.dashboardService
      .submitSettings(
        this.preferenceForm.value.previews,
        this.preferenceForm.value.emailNotifications,
        this.user.user.id,
      )
      .subscribe((res) => {
        this.changesApplied = true;
        this.userService.updateUser(res);
      });
  }
}
