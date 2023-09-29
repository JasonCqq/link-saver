import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { MatIconModule } from "@angular/material/icon";
import { ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule } from "@angular/material/core";

import { AppComponent } from "./app.component";
import { DashboardComponent } from "./Components/dashboard/main-dashboard/dashboard.component";
import { HomeComponent } from "./Components/home/home.component";
import { LoginComponent } from "./Components/user/login/login.component";
import { RegisterComponent } from "./Components/user/register/register.component";
import { LinkComponent } from "./Components/links/link-item/link-item.component";
import { BookmarksComponent } from "./Components/dashboard/bookmarks/bookmarks.component";
import { TrashbinComponent } from "./Components/dashboard/trashbin/trashbin.component";
import { SettingsComponent } from "./Components/dashboard/settings/settings.component";
import { UpcomingComponent } from "./Components/dashboard/upcoming/upcoming.component";
import { LinkFormComponent } from "./Components/links/link-form/link-form.component";
import { FoldersComponent } from "./Components/dashboard/folders/folders.component";

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HomeComponent,
    LoginComponent,
    LinkComponent,
    RegisterComponent,
    BookmarksComponent,
    TrashbinComponent,
    SettingsComponent,
    UpcomingComponent,
    LinkFormComponent,
    FoldersComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatIconModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatNativeDateModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
