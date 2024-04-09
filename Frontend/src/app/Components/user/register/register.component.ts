import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../user.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
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
  submitApplication(): void {
    this.userService
      .submitApplication(
        this.applyForm.value.username ?? "",
        this.applyForm.value.email ?? "",
        this.applyForm.value.password ?? "",
        "create",
      )
      .subscribe({
        next: (response) => {
          this.userService.updateUser(response);
          this.router.navigate(["/user/login"]);
        },
        error: (error) => {
          this.formErrors = error.error;
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
