import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ReactiveFormsModule } from "@angular/forms";

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

    InputTextModule,
    FloatLabelModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
})
export class UserModule {}
