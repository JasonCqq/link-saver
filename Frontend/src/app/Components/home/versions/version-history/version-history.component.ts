import { Component } from "@angular/core";

@Component({
  selector: "app-version-history",
  templateUrl: "./version-history.component.html",
  styleUrls: ["./version-history.component.scss"],
})
export class VersionHistoryComponent {
  activeID: number = 6;
  toggleActive(id: number): void {
    this.activeID = this.activeID === id ? 0 : id;
  }

  versions = [
    {
      id: 7,
      version: "1.3.1 - 05/12/24",
      updates: ["Change font to Reddit Sans"],
      qols: ["Add dates to versions", "Adjust home page slightly"],
      bugfixes: ["Fix bookmarks not updating properly"],
    },
    {
      id: 6,
      version: "1.3.0 - 05/04/24",
      updates: [
        "Updated fetching method, optimizing link adding speed",
        "Change buffer to file storage, should improve load speed",
        "Change color scheme",
        "Updated home page",
        "Updated UI",
        "Add preview to home page, and adjust mobile responsiveness",
      ],
      qols: ["Add version page to extra in settings"],
      bugfixes: [
        "Fix most errors on link adding",
        "Fix editing not updating realtime",
        "Fix coloring on toggle thumbnail",
        "Fix thumbnails for folders",
      ],
    },
    {
      id: 5,
      version: "1.2.2 - 04/29/24",
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
      version: "1.2.1 - 04/25/24",
      updates: ["Optimize link screenshot speed", "Update UI and color scheme"],
      qols: ["N/A"],
      bugfixes: ["N/A"],
    },
    {
      id: 3,
      version: "1.2.0 - 04/19/24",
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
      version: "1.1.0 - 04/14/24",
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
      version: "1.0.0 - 04/13/24",
      updates: ["First deployment"],
      qols: ["N/A"],
      bugfixes: ["N/A"],
    },
  ];
}
