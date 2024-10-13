import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./main-dashboard/dashboard.component";
import { FoldersComponent } from "./folders/folders.component";
import { SettingsComponent } from "./settings/settings.component";
import { UrlbankComponent } from "./urlbank/urlbank.component";

const routes: Routes = [
  { path: "", component: DashboardComponent },
  { path: "folders", component: FoldersComponent },
  { path: "urlbank", component: UrlbankComponent },
  { path: "settings", component: SettingsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
