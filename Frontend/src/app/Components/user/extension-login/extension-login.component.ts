import { Component } from "@angular/core";
import { UserService } from "../user.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-extension-login",
  imports: [],
  templateUrl: "./extension-login.component.html",
  styleUrl: "./extension-login.component.scss",
})
export class ExtensionLoginComponent {
  constructor(private userService: UserService) {
    this.user = this.userService.getUser()?.user;
  }

  private apiUrl = environment.apiUrl;
  user: any;

  EXTENSION_ID = "oocabgbbkhbipjpkchfejjglaaccckbn";

  async authorizeExtension() {
    try {
      const response = await fetch(
        `${this.apiUrl}/user/extension/generate-token/${this.userService.getUser()?.user.id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log(data);
      console.log(response.status);

      // Not Logged In
      if (response.status === 401) {
        window.location.href =
          "http://localhost:4200/user/login?redirect=/extension-connect";
        return;
      }

      if (!response.ok) {
        alert("Failed to generate token");
        return;
      }

      // Check if chrome API is available
      if (typeof chrome === "undefined" || !chrome.runtime) {
        alert(
          "Extension API not available. Make sure the extension is installed."
        );
        return;
      }

      // Send to extension
      chrome.runtime.sendMessage(
        this.EXTENSION_ID,
        {
          type: "AUTH_TOKEN",
          token: data.token,
          user: data.user,
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              "Failed to send to extension:",
              chrome.runtime.lastError
            );
            alert("Failed to connect to extension. Make sure it's installed.");
            return;
          }

          alert("Extension connected successfully!");
          window.close();
        }
      );
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect");
    }
  }
}
