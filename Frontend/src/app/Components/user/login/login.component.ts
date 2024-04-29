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
        "",
        this.applyLoginForm.value.password ?? "",
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
