import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./main-dashboard/dashboard.component";
import { BookmarksComponent } from "./bookmarks/bookmarks.component";
import { FoldersComponent } from "./folders/folders.component";
import { UpcomingComponent } from "./upcoming/upcoming.component";
import { TrashbinComponent } from "./trashbin/trashbin.component";
import { SettingsComponent } from "./settings/settings.component";

const routes: Routes = [
  { path: "", component: DashboardComponent },
  { path: "bookmarks", component: BookmarksComponent },
  { path: "folders", component: FoldersComponent },
  { path: "upcoming", component: UpcomingComponent },
  { path: "trash", component: TrashbinComponent },
  { path: "settings", component: SettingsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
