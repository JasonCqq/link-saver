import {
  NgModule,
  Injector,
  inject,
  provideAppInitializer,
} from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatIconModule } from "@angular/material/icon";

import { Observable, map, catchError, of } from "rxjs";
import { ReactiveFormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./Components/home/home.component";
import { UserService } from "./Components/user/user.service";
import { environment } from "../environments/environment";
import { PublicFolderComponent } from "./Components/public-folder/public-folder.component";
import { LoadingInterceptor } from "./Components/Loading.interceptor";
import { VersionHistoryComponent } from "./Components/home/versions/version-history/version-history.component";

import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { providePrimeNG } from "primeng/config";

import { MyPreset } from "./theme-preset";

import { AccordionModule } from "primeng/accordion";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TooltipModule } from "primeng/tooltip";

import { NgxBorderBeamComponent } from "@omnedia/ngx-border-beam";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";

interface User {
  user: {
    id: string;
    username: string;
    email: string;
    creationDate: Date;
    external_account: boolean;
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
  injector: Injector
): () => Observable<any> {
  const userService = injector.get(UserService);

  return () =>
    httpClient
      .get<User>(`${environment.apiUrl}/check`, { withCredentials: true })
      .pipe(
        map((res) => userService.setUser(res)),
        catchError((err) => {
          if (err.status === 401) {
            userService.setUser(null); // not logged in is OK
            return of(null); // allow app to bootstrap
          }
          throw err; // real errors should still crash
        })
      );
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PublicFolderComponent,
    VersionHistoryComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,

    AccordionModule,
    ButtonModule,
    NgxBorderBeamComponent,
    CardModule,
    TooltipModule,
    FloatLabelModule,
    InputTextModule,
  ],
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
      },
      ripple: true,
    }),

    provideAppInitializer(() => {
      const initializerFn = ((httpClient: HttpClient, injector: Injector) =>
        initializeAppFactory(httpClient, injector))(
        inject(HttpClient),
        inject(Injector)
      );
      return initializerFn();
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
