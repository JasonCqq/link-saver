import { Component, OnInit } from "@angular/core";
import { UserService } from "../../user/user.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { DashboardService } from "../dashboard.service";
import { LinkService } from "../links/link-item/link-item.service";
import { Theme } from "src/app/theme.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  constructor(
    private userService: UserService,
    private dashboardService: DashboardService,
    private linkService: LinkService,
    private themeService: Theme,
  ) {}

  user: any;

  ngOnInit(): void {
    this.user = this.userService.getUser();

    if (this.user) {
      this.preferenceForm.patchValue({
        previews: this.user.settings.previews,
      });
    }
  }

  passwordChangeOverlay: boolean = false;
  passwordChangeForm = new FormGroup({
    currentPass: new FormControl("", [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
    ]),
    newPass: new FormControl("", [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
    ]),
    newPass2: new FormControl("", [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
    ]),
  });

  formErrors: any;
  submitPasswordChange(): void {
    if (
      this.passwordChangeForm.value.newPass !==
      this.passwordChangeForm.value.newPass2
    ) {
      this.formErrors = "New passwords do not match";
      return;
    }

    this.userService
      .changePassword(
        this.passwordChangeForm.value.currentPass ?? "",
        this.passwordChangeForm.value.newPass ?? "",
        this.passwordChangeForm.value.newPass2 ?? "",
      )
      .subscribe({
        next: () => {
          this.togglePassChangeForm();
          this.passwordChangeForm.reset();
          alert("Your password has successfully been changed");
        },
        error: (error) => {
          this.formErrors = error.error;
        },
      });
  }

  togglePassChangeForm(): void {
    this.passwordChangeOverlay = !this.passwordChangeOverlay;
  }

  setTheme(theme: string) {
    this.themeService.setTheme(theme);
  }

  preferenceForm = new FormGroup({
    previews: new FormControl(),
  });

  changesApplied = false;
  submitPreferenceForm(): void {
    this.dashboardService
      .submitSettings(this.preferenceForm.value.previews, this.user.user.id)
      .subscribe((res) => {
        this.changesApplied = true;
        this.userService.updateUser(res);
        this.linkService.setThumbnail(this.preferenceForm.value.previews);
      });
  }

  deletePrompt: boolean = false;
  toggleDeletePrompt(): void {
    this.deletePrompt = !this.deletePrompt;
  }

  deleteAccount(): void {
    if ((<HTMLInputElement>document.getElementById("delete-confirm")).value) {
      this.userService.deleteAccount(
        (<HTMLInputElement>document.getElementById("delete-confirm")).value,
      );
    }
  }
}
