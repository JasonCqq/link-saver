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

import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from "./main-dashboard/dashboard.component";
import { BookmarksComponent } from "./bookmarks/bookmarks.component";
import { FoldersComponent } from "./folders/folders.component";
import { UpcomingComponent } from "./upcoming/upcoming.component";
import { TrashbinComponent } from "./trashbin/trashbin.component";
import { SettingsComponent } from "./settings/settings.component";

import { LinkFormComponent } from "./links/link-form/link-form.component";
import { LinkComponent } from "./links/link-item/link-item.component";

@NgModule({
  declarations: [
    DashboardComponent,
    BookmarksComponent,
    FoldersComponent,
    UpcomingComponent,
    TrashbinComponent,
    LinkFormComponent,
    LinkComponent,
    SettingsComponent,
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
  ],
})
export class DashboardModule {}
