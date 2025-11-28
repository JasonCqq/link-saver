import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../user.service";
import { LoadingService } from "../../LoadingInterceptor.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class RegisterComponent implements OnInit {
  constructor(
    private userService: UserService,
    public loadingService: LoadingService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  applyForm = new FormGroup({
    username: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    emailConfirm: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
    ]),
  });
  formErrors: any;
  formLoading: boolean = false;
  otpSent: boolean = false;

  submitApplication(): void {
    if (this.applyForm.value.email !== this.applyForm.value.emailConfirm) {
      this.formErrors = "Emails do not match.";
      return;
    }

    this.formLoading = true;
    this.userService
      .submitRegister(
        this.applyForm.value.username ?? "",
        this.applyForm.value.email ?? "",
        this.applyForm.value.password ?? "",
        false
      )
      .subscribe({
        next: (response) => {
          this.userService.updateUser(response);
          this.formLoading = false;
          this.zone.run(() => {
            this.router.navigate(["/dashboard"]);
          });
        },
        error: (error) => {
          this.formErrors = error.error;
          this.formLoading = false;
        },
      });
  }

  ngOnInit(): void {
    this.applyForm.valueChanges.subscribe();

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
        .join("")
    );

    return JSON.parse(jsonPayload);
  }

  // Google Signin
  handleCredentialResponse(response: any) {
    const responsePayload = this.decodeJwtResponse(response.credential);
    this.formLoading = true;

    this.userService
      .submitRegister(
        responsePayload.email,
        responsePayload.email,
        response.credential,
        true
      )
      .subscribe({
        next: (response) => {
          this.userService.updateUser(response);
          this.formLoading = false;
          this.zone.run(() => {
            this.router.navigate(["/dashboard"]);
          });
        },
        error: (error) => {
          this.formLoading = false;
          this.formErrors = error.error;
          this.cdr.detectChanges();
        },
      });
  }

  get email() {
    return this.applyForm.get("email");
  }
  get username() {
    return this.applyForm.get("username");
  }
  get password() {
    return this.applyForm.get("password");
  }

  get emailConfirm() {
    return this.applyForm.get("emailConfirm");
  }
}
