import { Component } from "@angular/core";

@Component({
  selector: "app-version-history",
  templateUrl: "./version-history.component.html",
  styleUrls: ["./version-history.component.scss"],
})
export class VersionHistoryComponent {
  activeID: number = 10;
  toggleActive(id: number): void {
    this.activeID = this.activeID === id ? 0 : id;
  }

  versions = [
    {
      id: 10,
      version: "2.1.0 - TBD",
      updates: [
        "Implemented a feature to automatically section your dashboard (In Progress) \n - by grouping similar titles/urls and separate them into different groups in dashboard",
        "Removed link reminding feature, will bring back in the future if requested",
        "Removed preview disabling temporarily, you can change it in your settings",
        "Enhanced landing page",
      ],
      qols: [
        "Deactivating account now requires password instead",
        "Ability to login with Email",
        "Added dim theme",
        "Change contact form to a pop up",
        "Added back to top button to dashboard",
        "Mobiles with <390px can fit 2 links in dashboard",
        "Added userID and more link references in settings",
        "Updated logo and title",
      ],
      bugfixes: [
        "Fixed sorting not working when switching tabs",
        "Fixed not being able to copy link addresses",
      ],
    },
    {
      id: 9,
      version: "2.0.1 - 08/27/24",
      updates: [
        "Implemented sorting functionality and options",
        "(Sort by visits, name, dates)",
        "Added visit counter on links",
        "(Visit counter also now counts when you middle click to open in new tab)",
      ],
      qols: [
        "Added a new panel to display the available source code",
        "Redesigned contact form slightly",
        "Updated homepage demo video",
        "Updated visuals slightly",
        "Updated home picture",
      ],
      bugfixes: ["Fixed margins being off on mobile in homepage"],
    },
    {
      id: 8,
      version: "2.0.0 - 08/09/24",
      updates: [
        "Discontinued screenshot feature for now, load time from budget server took too long",
        "Refactored scraping method to speed up adding links",
        "Changed link items' visual format",
        "Improved security overall",
      ],
      qols: [
        'Replaced blank/broken images with text: "No Image Found"',
        "Updated homepage picture",
        "Adjusted colors and UI",
        "Relocated sidebar functions",
        "Fixed some fonts not matching the rest",
        "Adjusted loader message",
      ],
      bugfixes: [
        "Fixed bookmarks and upcoming links showing up when deleted",
        "Fixed UI issue in public folders",
      ],
    },
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
