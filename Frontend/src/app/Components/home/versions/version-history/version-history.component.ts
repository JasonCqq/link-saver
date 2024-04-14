import { Component } from "@angular/core";

@Component({
  selector: "app-version-history",
  templateUrl: "./version-history.component.html",
  styleUrls: ["./version-history.component.scss"],
})
export class VersionHistoryComponent {
  activeID: number = 2;
  toggleActive(id: number): void {
    this.activeID = this.activeID === id ? 0 : id;
  }

  versions = [
    {
      id: 2,
      version: "1.1.0 (Current)",
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
