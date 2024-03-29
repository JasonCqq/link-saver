import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../user.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../register/register.component.scss"],
})
export class LoginComponent implements OnInit {
  // Checks for user
  constructor(private userService: UserService) {}
  user: any;

  ngOnInit(): void {
    this.applyLoginForm.valueChanges.subscribe();
    this.user = this.userService.getUser()?.user;
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
  submitLoginApplication(): void {
    this.userService.submitApplication(
      this.applyLoginForm.value.username ?? "",
      "",
      this.applyLoginForm.value.password ?? "",
      "login",
    );
  }

  get username() {
    return this.applyLoginForm.get("username");
  }
  get password() {
    return this.applyLoginForm.get("password");
  }
}
