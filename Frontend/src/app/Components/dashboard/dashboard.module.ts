import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatNativeDateModule } from "@angular/material/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";

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

import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";

import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { MenuModule } from "primeng/menu";
import { DrawerModule } from "primeng/drawer";
import { TooltipModule } from "primeng/tooltip";
import { MenubarModule } from "primeng/menubar";
import { SelectModule } from "primeng/select";

import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { FloatLabelModule } from "primeng/floatlabel";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ViewerComponent } from "./links/viewer/viewer.component";

import { SafeUrlPipe } from "./safeUrlPipe";
import { WebViewComponent } from "./links/web-view/web-view.component";

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
    ViewerComponent,
    WebViewComponent,
  ],
  imports: [
    SafeUrlPipe,
    CommonModule,
    DashboardRoutingModule,
    MatIconModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    DragDropModule,

    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    MenuModule,
    DrawerModule,
    TooltipModule,
    MenubarModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    FloatLabelModule,
    ToggleSwitchModule,
    ProgressSpinnerModule,
  ],

  exports: [LinkComponent],
})
export class DashboardModule {}
