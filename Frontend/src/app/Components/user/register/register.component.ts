import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../user.service";
import { LoadingService } from "../../LoadingInterceptor.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  constructor(
    private userService: UserService,
    public loadingService: LoadingService,
    private router: Router,
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
    console.log(this.applyForm.value.email, this.applyForm.value.emailConfirm);
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
      )
      .subscribe({
        next: (response) => {
          // this.otpSent = true;
          this.userService.updateUser(response);
          this.formLoading = false;
          this.router.navigate(["/dashboard"]);
        },
        error: (error) => {
          this.formErrors = error.error;
          this.formLoading = false;
        },
      });
  }

  ngOnInit(): void {
    this.applyForm.valueChanges.subscribe();
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
}
