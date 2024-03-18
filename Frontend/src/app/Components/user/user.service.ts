import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Router } from "@angular/router";
import { BehaviorSubject, empty } from "rxjs";

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

  private userSubject = new BehaviorSubject<User>(this.emptyUser);
  user$ = this.userSubject.asObservable();

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
            if (response && (response as any).user) {
              this.setUser((response as any).user as User);
              this.router.navigate(["/dashboard"]);
            }
          },
          error: (error) => console.log(error),
        });
    } catch (err) {
      console.log("POST call failed", err);
      throw err;
    }
  }

  //Asychronous timing issues (To Be Fixed)
  setUser(user: User) {
    this.userSubject.next(user);
  }
  getUser() {
    console.log(this.userSubject.value);
    return this.userSubject.value;
  }
  updateUser(user: any) {
    this.userSubject.next(user);
  }

  // Logout user
  async logOutUser() {
    try {
      await this.http
        .get(`${this.apiUrl}/user/logout`, { withCredentials: true })
        .subscribe({
          next: (response) => {
            if (response && (response as any).success === true) {
              this.router.navigate(["/"]);
            }
            this.userSubject.next(this.emptyUser);
          },
          error: (error) => console.log(error),
        });
    } catch (err) {
      console.log(err);
    }
  }
}
