import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../user.service";
import { Router } from "@angular/router";
import { pipe, catchError } from "rxjs";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../login/login.component.scss"],
})
export class LoginComponent implements OnInit {
  // Checks for user
  constructor(private userService: UserService) {}
  user: any;

  ngOnInit(): void {
    this.applyLoginForm.valueChanges.subscribe();
    this.user = this.userService.getUser()?.user;
  }

  loginForm: boolean = true;
  toggleForm(): void {
    this.loginForm = !this.loginForm;
  }

  applyLoginForm = new FormGroup({
    username: new FormControl("", [Validators.required]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
    ]),
  });

  forgotPasswordForm = new FormGroup({
    forgot_email: new FormControl({ value: "", disabled: false }, [
      Validators.required,
      Validators.email,
    ]),

    forgot_otp: new FormControl(""),
  });

  // Submit Login Form
  submitLoginApplication(): void {
    this.userService.submitApplication(
      this.applyLoginForm.value.username ?? "",
      "",
      this.applyLoginForm.value.password ?? "",
      "login",
    );
  }

  // Submit forgot password form

  forgotSuccess: boolean = false;
  forgotSuccess2: boolean = false;
  submitForgotApplication(): void {
    this.userService
      .forgotPassword(this.forgotPasswordForm.value.forgot_email ?? "")
      .pipe(
        catchError((err) => {
          alert(JSON.stringify(err.error.errors));
          throw err;
        }),
      )
      .subscribe({
        next: (res) => {
          this.forgotPasswordForm.get("forgot_email")?.disable();
          this.forgotSuccess = true;
        },
        error: (err) => {
          console.error("Error after catchError:", err);
        },
      });
  }

  submitOTPApplication(): void {
    if (
      this.forgotSuccess !== true &&
      !this.forgotPasswordForm.value.forgot_otp
    ) {
      return;
    }

    this.userService
      .submitOTP(
        this.forgotPasswordForm.getRawValue().forgot_email ?? "",
        this.forgotPasswordForm.value.forgot_otp ?? "",
      )
      .pipe(
        catchError((err) => {
          alert(JSON.stringify(err.error.errors));
          throw err;
        }),
      )
      .subscribe({
        next: (res) => {
          this.forgotSuccess2 = true;
          this.forgotPasswordForm.get("forgot_otp")?.disable();
        },
        error: (err) => {
          console.error("Error after catchError:", err);
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
    if (this.forgotSuccess && this.forgotSuccess2) {
      if (
        this.newPasswordForm.value.forgot_new_pass ===
        this.newPasswordForm.value.forgot_new_pass2
      ) {
        this.userService
          .submitNewPassword(
            this.forgotPasswordForm.getRawValue().forgot_email ?? "",
            this.newPasswordForm.value.forgot_new_pass ?? "",
            this.newPasswordForm.value.forgot_new_pass2 ?? "",
          )
          .pipe(
            catchError((err) => {
              alert(JSON.stringify(err.error.errors));
              throw err;
            }),
          )
          .subscribe({
            next: (res) => {
              this.toggleForm();
            },
            error: (err) => {
              console.error("Error after catchError:", err);
            },
          });
      } else {
        alert("New passwords do not match");
      }
    }
  }

  get username() {
    return this.applyLoginForm.get("username");
  }
  get password() {
    return this.applyLoginForm.get("password");
  }

  get forgot_email() {
    return this.forgotPasswordForm.get("forgot_email");
  }

  get forgot_otp() {
    return this.forgotPasswordForm.get("forgot_otp");
  }
}
