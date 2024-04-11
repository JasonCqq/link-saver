import { NgModule, APP_INITIALIZER, Injector } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Observable, map } from "rxjs";
import { ReactiveFormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./Components/home/home.component";
import { UserService } from "./Components/user/user.service";
import { environment } from "../environments/environment";
import { PublicFolderComponent } from "./Components/public-folder/public-folder.component";

interface User {
  user: {
    id: string;
    username: string;
    email: string;
    creationDate: Date;
  };
  settings: {
    id: string;
    userId: string;
    previews: boolean;
    emailNotifications: boolean;
  };
}

// Checks for user session
function initializeAppFactory(
  httpClient: HttpClient,
  injector: Injector,
): () => Observable<any> {
  const userService = injector.get(UserService);

  return () =>
    httpClient
      .get<User>(`${environment.apiUrl}/check`, { withCredentials: true })
      .pipe(map((res) => userService.setUser(res)));
}

@NgModule({
  declarations: [AppComponent, HomeComponent, PublicFolderComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatIconModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (httpClient: HttpClient, injector: Injector) =>
        initializeAppFactory(httpClient, injector),
      deps: [HttpClient, Injector],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
