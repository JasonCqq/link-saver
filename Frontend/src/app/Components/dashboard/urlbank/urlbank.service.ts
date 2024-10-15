import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { UserService } from "../../user/user.service";
import { Observable, map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UrlBankService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}
  private apiUrl = environment.apiUrl;

  submitForm(urls: string[]): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/url/create`,
      {
        userID: this.userService.getUser()?.user.id,
        urls: urls,
      },
      {
        withCredentials: true,
      },
    );
  }

  getUrls() {
    return this.http
      .get(`${this.apiUrl}/url/${this.userService.getUser()?.user.id}`, {
        withCredentials: true,
      })
      .pipe(map((response: any) => response.urls));
  }

  deleteUrl(id: string) {
    return this.http.delete(`${this.apiUrl}/url/delete`, {
      body: {
        id: id,
        userID: this.userService.getUser()?.user.id,
      },
      withCredentials: true,
    });
  }

  deleteAllUrls() {
    return this.http.delete(`${this.apiUrl}/url/deleteAll`, {
      body: {
        userID: this.userService.getUser()?.user.id,
      },
      withCredentials: true,
    });
  }
}
