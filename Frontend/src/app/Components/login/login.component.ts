import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { RegisterService } from "../register/register.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../register/register.component.scss"],
})
export class LoginComponent implements OnInit {
  constructor(private registerService: RegisterService) {}

  applyLoginForm = new FormGroup({
    username: new FormControl("", [Validators.required]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
    ]),
  });

  submitLoginApplication(): void {
    this.registerService.submitApplication(
      this.applyLoginForm.value.username ?? "",
      this.applyLoginForm.value.password ?? "",
      "",
      "login",
    );
  }

  ngOnInit(): void {
    this.applyLoginForm.valueChanges.subscribe();
  }

  get username() {
    return this.applyLoginForm.get("username");
  }

  get password() {
    return this.applyLoginForm.get("password");
  }
}
