import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
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
  submitLogin(username: string, password: string) {
    return this.http.post(
      `${this.apiUrl}/user/login`,
      {
        username: username,
        password: password,
      },
      { withCredentials: true },
    );
  }

  getOTPLink(username: string, email: string, password: string) {
    return this.http.post(
      `${this.apiUrl}/user/createOTPLink`,
      {
        username: username,
        email: email,
        password: password,
      },
      { withCredentials: true },
    );
  }

  async logOutUser() {
    await this.http
      .get(`${this.apiUrl}/user/logout`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          if (response) {
            this.userSubject.next(null);
            this.router.navigate(["/"]);
          }
        },
        error: (error) => alert(JSON.stringify(error.error)),
      });
  }

  async deleteAccount() {
    await this.http
      .delete(`${this.apiUrl}/user/delete_account`, {
        body: {
          userID: this.getUser()?.user.id,
        },
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          this.userSubject.next(null);
          alert("Your account has been deleted.");
          this.router.navigate(["/"]);
        },
        error: (error) => alert(JSON.stringify(error.error)),
      });
  }

  // Forgot Password Process
  changePassword(currentPass: string, newPass: string, newPass2: string) {
    return this.http.put(
      `${this.apiUrl}/user/change_password`,
      {
        userID: this.getUser()?.user.id,
        currentPass: currentPass,
        newPass: newPass,
        newPass2: newPass2,
      },
      { withCredentials: true },
    );
  }

  forgotPassword(forgot_email: string) {
    return this.http.post(
      `${this.apiUrl}/user/forgot_password`,
      { email: forgot_email },
      { withCredentials: true },
    );
  }

  submitOTP(forgot_email: string, forgot_otp: string) {
    return this.http.post(
      `${this.apiUrl}/user/verify_otp`,
      { email: forgot_email, otp: forgot_otp },
      { withCredentials: true },
    );
  }

  submitNewPassword(
    forgot_email: string,
    forgot_new_pass: string,
    forgot_new_pass2: string,
  ) {
    return this.http.post(
      `${this.apiUrl}/user/change_password_otp`,
      {
        email: forgot_email,
        new_pass: forgot_new_pass,
        new_pass2: forgot_new_pass2,
      },
      { withCredentials: true },
    );
  }
}
