import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";

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

@Injectable({
  providedIn: "root",
})
export class UserService {
  // Assign user
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // Guest User
  emptyUser = {
    user: {
      id: "",
      username: "",
      email: "",
      creationDate: new Date(0),
    },
    settings: {
      id: "",
      userId: "",
      previews: true,
      emailNotifications: true,
    },
  };

  private userSubject = new BehaviorSubject<User | null>(this.emptyUser);
  user$ = this.userSubject.asObservable();

  setUser(user: User) {
    this.userSubject.next(user);
  }
  getUser() {
    return this.userSubject.value;
  }
  updateUser(user: any) {
    this.userSubject.next(user);
  }

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
        .post(
          `${this.apiUrl}/user/${action}`,
          {
            username: username,
            email: email,
            password: password,
          },
          { withCredentials: true },
        )
        .subscribe({
          next: (response) => {
            if ((response as User) && action === "login") {
              this.updateUser(response);
              this.router.navigate(["/dashboard"]);
            } else if ((response as User) && action === "create") {
              this.updateUser(response);
              this.router.navigate(["/user/login"]);
            }
          },
          error: (error) =>
            action === "create"
              ? alert(JSON.stringify(error.error.errors))
              : alert(error.error.message),
        });
    } catch (err) {
      console.log("POST call failed", err);
      throw err;
    }
  }

  // Logout user
  async logOutUser() {
    try {
      await this.http
        .get(`${this.apiUrl}/user/logout`, { withCredentials: true })
        .subscribe({
          next: (response) => {
            if (response) {
              this.userSubject.next(null);
              this.router.navigate(["/"]);
            }
          },
          error: (error) => alert(JSON.stringify(error.error.errors)),
        });
    } catch (err) {
      console.log(err);
    }
  }
}
