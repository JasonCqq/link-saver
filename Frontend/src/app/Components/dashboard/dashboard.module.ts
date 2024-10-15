import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule } from "@angular/material/snack-bar";

import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from "./main-dashboard/dashboard.component";
import { FoldersComponent } from "./folders/folders.component";
import { SettingsComponent } from "./settings/settings.component";

import { LinkFormComponent } from "./links/link-form/link-form.component";
import { LinkComponent } from "./links/link-item/link-item.component";
import { MainSidebarComponent } from "./main-sidebar/main-sidebar.component";
import { MainNavComponent } from "./main-nav/main-nav.component";
import { LinkEditFormComponent } from "./links/link-edit-form/link-edit-form.component";
import { MassEditFormComponent } from "./links/mass-edit-form/mass-edit-form.component";
import { UrlbankComponent } from "./urlbank/urlbank.component";

@NgModule({
  declarations: [
    DashboardComponent,
    FoldersComponent,
    LinkFormComponent,
    LinkComponent,
    SettingsComponent,
    MainSidebarComponent,
    MainNavComponent,
    LinkEditFormComponent,
    MassEditFormComponent,
    UrlbankComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatSidenavModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],

  exports: [LinkComponent],
})
export class DashboardModule {}
