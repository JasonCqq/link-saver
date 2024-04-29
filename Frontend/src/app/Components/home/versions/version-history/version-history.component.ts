import { Component } from "@angular/core";

@Component({
  selector: "app-version-history",
  templateUrl: "./version-history.component.html",
  styleUrls: ["./version-history.component.scss"],
})
export class VersionHistoryComponent {
  activeID: number = 5;
  toggleActive(id: number): void {
    this.activeID = this.activeID === id ? 0 : id;
  }

  versions = [
    {
      id: 5,
      version: "1.2.2 (Current)",
      updates: ["Add Email Confirmation function when registering"],
      qols: [
        "Add email confirmation link sent page",
        "Update font to Work Sans",
        "Update landing page slightly",
        "Add slight improvement to coloring",
      ],
      bugfixes: [
        "Fix thumbnail sizing",
        "Fix mass edit not displaying selected items",
        "Fix forgot password form button not working after entering invalid email",
      ],
    },
    {
      id: 4,
      version: "1.2.1",
      updates: ["Optimize link screenshot speed", "Update UI and color scheme"],
      qols: ["N/A"],
      bugfixes: ["N/A"],
    },
    {
      id: 3,
      version: "1.2.0",
      updates: [
        "Optimize link screenshots drastically",
        "Update thumbnail to be video's thumbnail if link contains video",
        "Can now screenshot most websites",
      ],
      qols: [
        "Changed size of link items",
        "Added helpful messages to loaders",
        "Added Small UI changes",
        "Added a loader to folders",
      ],
      bugfixes: [
        "Fix scrolling issues on mobile",
        "Fix UI on public folders",
        "Fix folder share functions not updating properly",
        "Fix images on public folders not working",
      ],
    },
    {
      id: 2,
      version: "1.1.0",
      updates: ["Add a version history page", "Optimize puppeteer slightly"],
      qols: [
        "Add loaders",
        "Change demo video",
        "Adjust mobile responsiveness",
        "Add extra notes - (Incognito doesn't work yet), (Incorrect titles/previews note)",
      ],
      bugfixes: [
        "Fix contact page FormSubmit submission",
        "Fix edit folder name button",
        "Fix real time updates for functions",
        "Fix forgot password form buttons when emails are not found",
        "Fix login form crashing server",
      ],
    },

    {
      id: 1,
      version: "1.0.0",
      updates: ["First deployment"],
      qols: ["N/A"],
      bugfixes: ["N/A"],
    },
  ];
}
