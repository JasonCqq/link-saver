import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../user.service";
import { Router } from "@angular/router";
import { LoadingService } from "../../LoadingInterceptor.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../login/login.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  // Checks for user
  constructor(
    private userService: UserService,
    private router: Router,
    public loadingService: LoadingService,
  ) {}
  user: any;

  ngOnInit(): void {
    this.applyLoginForm.valueChanges.subscribe();
    this.user = this.userService.getUser()?.user;

    // Google Signin
    this.loadGoogleScript();
    (window as any).handleCredentialResponse =
      this.handleCredentialResponse.bind(this);
  }

  // Google Signin
  loadGoogleScript() {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
  // Google Signin
  decodeJwtResponse(token: any) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    return JSON.parse(jsonPayload);
  }

  // Google Signin
  handleCredentialResponse(response: any) {
    console.log("Google Credential Response:", response);

    // const responsePayload = this.decodeJwtResponse(response.credential);

    this.userService
      .submitLogin(response.credential, response.credential, true)
      .subscribe({
        next: (response) => {
          // this.otpSent = true;
          this.userService.updateUser(response);
          this.router.navigate(["/dashboard"]);
        },
        error: (error) => {
          this.formErrors = error.error;
        },
      });
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

  // Submit Login Form
  formErrors: any;
  submitLoginApplication(): void {
    this.userService
      .submitLogin(
        this.applyLoginForm.value.username ?? "",
        this.applyLoginForm.value.password ?? "",
        false,
      )
      .subscribe({
        next: (response) => {
          this.userService.updateUser(response);
          this.router.navigate(["/dashboard"]);
        },
        error: (error) => {
          this.formErrors = error.error;
        },
      });
  }

  get username() {
    return this.applyLoginForm.get("username");
  }
  get password() {
    return this.applyLoginForm.get("password");
  }
}
