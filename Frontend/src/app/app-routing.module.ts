import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./Components/home/home.component";
import { AuthGuard } from "./auth.guard";
import { PublicFolderComponent } from "./Components/public-folder/public-folder.component";
import { VersionHistoryComponent } from "./Components/home/versions/version-history/version-history.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "versions", component: VersionHistoryComponent },
  { path: "public/:id", component: PublicFolderComponent },

  {
    path: "user",
    loadChildren: () =>
      import("./Components/user/user.module").then((m) => m.UserModule),
  },
  {
    path: "dashboard",
    loadChildren: () =>
      import("./Components/dashboard/dashboard.module").then(
        (m) => m.DashboardModule,
      ),
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: "enabled",
      anchorScrolling: "enabled",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
