import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { UserService } from "../../user/user.service";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UrlBankService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}
  private apiUrl = environment.apiUrl;

  async submitForm(urls: string) {
    await this.http
      .post(
        `${this.apiUrl}/url/create`,
        {
          userID: this.userService.getUser()?.user.id,
          urls: urls,
        },
        {
          withCredentials: true,
        },
      )
      .subscribe({
        next: (res: any) => {
          console.log("Success", res);
        },
        error: (error) => {
          alert(error.error);
        },
      });
  }

  getUrls() {
    return this.http
      .get(`${this.apiUrl}/url/${this.userService.getUser()?.user.id}`, {
        withCredentials: true,
      })
      .pipe(map((response: any) => response.urls));
  }
}
