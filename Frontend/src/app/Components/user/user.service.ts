import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Router } from "@angular/router";

interface User {
  id: string;
  username: string;
  email: string;
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  private apiUrl = environment.apiUrl;

  // Registration & Login Form (Sends POST to /create or /login)
  async submitApplication(
    username: string,
    email: string,
    password: string,
    action: "create" | "login",
  ) {
    try {
      await this.http
        .post(`${this.apiUrl}/user/${action}`, {
          username: username,
          email: email,
          password: password,
        })
        .subscribe({
          next: (response) => {
            if (response && (response as any).user) {
              this.setUser((response as any).user as User);
            }
          },
          error: (error) => console.log(error),
        });
    } catch (err) {
      console.log("POST call failed", err);
      throw err;
    }
  }

  // Assign user
  private user?: User;

  setUser(user: User) {
    this.user = user;
  }
  getUser() {
    return this.user;
  }

  // Logout user
  async logOutUser() {
    try {
      await this.http.put(`${this.apiUrl}/user/logout`, {}).subscribe({
        next: (response) => {
          if (response && (response as any).success === true) {
            this.router.navigate(["/"]);
          }
          this.user = undefined;
        },
        error: (error) => console.log(error),
      });
    } catch (err) {
      console.log(err);
    }
  }
}
