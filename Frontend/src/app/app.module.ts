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
      .pipe(map((res) => userService.setUser(res)));
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
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,

    AccordionModule,
    ButtonModule,
    NgxBorderBeamComponent,
    CardModule,
    TooltipModule,
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
