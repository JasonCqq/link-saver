import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { UserRoutingModule } from "./user-routing.module";
import { RegisterComponent } from "./register/register.component";
import { LoginComponent } from "./login/login.component";
import { ForgotLoginComponent } from "./forgot-login/forgot-login.component";

import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { ButtonModule } from "primeng/button";
import { ProgressSpinnerModule } from "primeng/progressspinner";

@NgModule({
  declarations: [RegisterComponent, LoginComponent, ForgotLoginComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,

    InputTextModule,
    FloatLabelModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
})
export class UserModule {}
