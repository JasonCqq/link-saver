import { Component, EventEmitter, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../user.service";
import { LoadingService } from "../../LoadingInterceptor.service";

@Component({
  selector: "app-forgot-login",
  templateUrl: "./forgot-login.component.html",
  styleUrls: ["./forgot-login.component.scss"],
  standalone: false,
})
export class ForgotLoginComponent {
  constructor(
    private userService: UserService,
    public loadingService: LoadingService
  ) {}

  @Output() toggleFormE = new EventEmitter<void>();
  toggleForm(): void {
    this.toggleFormE.emit();
  }

  forgotPasswordForm = new FormGroup({
    forgot_email: new FormControl({ value: "", disabled: false }, [
      Validators.required,
      Validators.email,
    ]),

    forgot_otp: new FormControl(""),
  });

  // Submit forgot password form
  step1: boolean = false;
  step2: boolean = false;
  forgotFormErrors: any;

  submitForgotApplication(): void {
    this.forgotFormErrors = "Please check spam as well.";
    this.userService
      .forgotPassword(this.forgotPasswordForm.value.forgot_email ?? "")
      .subscribe({
        next: () => {
          this.forgotPasswordForm.get("forgot_email")?.disable();
          this.step1 = true;
        },
        error: (err) => {
          this.forgotFormErrors = err.error;
          this.step1 = false;
        },
      });
  }

  submitOTPApplication(): void {
    this.forgotFormErrors = "";
    if (this.step1 !== true && !this.forgotPasswordForm.value.forgot_otp) {
      return;
    }

    console.log(
      this.forgotPasswordForm.getRawValue().forgot_email ?? "",
      this.forgotPasswordForm.value.forgot_otp ?? ""
    );

    this.userService
      .submitOTP(
        this.forgotPasswordForm.getRawValue().forgot_email ?? "",
        this.forgotPasswordForm.value.forgot_otp ?? ""
      )
      .subscribe({
        next: () => {
          this.step2 = true;
          this.forgotPasswordForm.get("forgot_otp")?.disable();
        },
        error: (err) => {
          this.forgotFormErrors = err.error;
        },
      });
  }

  newPasswordForm = new FormGroup({
    forgot_new_pass: new FormControl("", [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
    ]),

    forgot_new_pass2: new FormControl("", [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
    ]),
  });

  submitNewPasswordApplication(): void {
    this.forgotFormErrors = "";
    if (this.step1 && this.step2) {
      if (
        this.newPasswordForm.value.forgot_new_pass ===
        this.newPasswordForm.value.forgot_new_pass2
      ) {
        this.userService
          .submitNewPassword(
            this.forgotPasswordForm.getRawValue().forgot_email ?? "",
            this.newPasswordForm.value.forgot_new_pass ?? "",
            this.newPasswordForm.value.forgot_new_pass2 ?? ""
          )
          .subscribe({
            next: () => {
              this.toggleForm();
              this.step1 = false;
              this.step2 = false;
            },
            error: (err) => {
              this.forgotFormErrors = err.error;
            },
          });
      } else {
        this.forgotFormErrors = "New passwords do not match.";
      }
    }
  }

  get forgot_email() {
    return this.forgotPasswordForm.get("forgot_email");
  }

  get forgot_otp() {
    return this.forgotPasswordForm.get("forgot_otp");
  }

  get forgot_new_pass() {
    return this.newPasswordForm.get("forgot_new_pass");
  }

  get forgot_new_pass2() {
    return this.newPasswordForm.get("forgot_new_pass2");
  }
}
