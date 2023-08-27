import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { RegisterService } from "./register.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  constructor(private registerService: RegisterService) {}

  applyForm = new FormGroup({
    username: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
    ]),
  });

  submitApplication(): void {
    this.registerService.submitApplication(
      this.applyForm.value.username ?? "",
      this.applyForm.value.email ?? "",
      this.applyForm.value.password ?? "",
    );
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
