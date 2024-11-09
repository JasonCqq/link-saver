import { Component, OnInit } from "@angular/core";
import { UserService } from "../../user/user.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Theme } from "src/app/theme.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  constructor(
    private userService: UserService,

    private themeService: Theme,
  ) {}

  user: any;

  ngOnInit(): void {
    this.user = this.userService.getUser();
    console.log(this.user);
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

  deletePrompt: boolean = false;
  toggleDeletePrompt(): void {
    this.deletePrompt = !this.deletePrompt;
  }

  deleteAccount(): void {
    if (
      (<HTMLInputElement>document.getElementById("delete-confirm")).value ===
      "confirmdelete"
    ) {
      this.userService.deleteAccount();
    }
  }
}
