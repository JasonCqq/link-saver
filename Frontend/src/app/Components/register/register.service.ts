import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";

@Injectable({
  providedIn: "root",
})
export class RegisterService {
  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  async submitApplication(username: string, email: string, password: string) {
    try {
      await this.http
        .post(`${this.apiUrl}/user/create`, {
          username: username,
          email: email,
          password: password,
        })

        .subscribe(
          (val) => {
            console.log("POST call successful value returned in body", val);
          },
          (response) => {
            console.log("POST call in error", response);
          },
          () => {
            console.log("The POST observable is now completed.");
          },
        );
    } catch (err) {
      console.log("POST call failed", err);
      throw err;
    }
  }
}
