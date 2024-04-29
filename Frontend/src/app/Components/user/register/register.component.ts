import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../user.service";
import { LoadingService } from "../../LoadingInterceptor.service";

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
  ) {}

  applyForm = new FormGroup({
    username: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
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
    this.formLoading = true;
    this.userService
      .getOTPLink(
        this.applyForm.value.username ?? "",
        this.applyForm.value.email ?? "",
        this.applyForm.value.password ?? "",
      )
      .subscribe({
        next: () => {
          this.otpSent = true;
          this.formLoading = false;
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
