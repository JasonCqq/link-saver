import { Component, OnDestroy, OnInit } from "@angular/core";
import { UserService } from "../user/user.service";
import { Subject, takeUntil } from "rxjs";
import { Theme } from "src/app/theme.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  // Checks for user
  constructor(
    private userService: UserService,
    private themeService: Theme,
  ) {}

  private destroy$ = new Subject<void>();

  user: any;
  theme: any;

  contactForm: boolean = false;
  toggleContact() {
    this.contactForm = !this.contactForm;
  }

  videoShowcase: boolean = false;
  toggleShowcase() {
    this.videoShowcase = !this.videoShowcase;
  }

  toggleTheme(res: string) {
    if (this.theme === "dark") {
      this.theme = "light";
    } else {
      this.theme = "dark";
    }

    this.themeService.setTheme(res);
  }

  ngOnInit() {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.user = user?.user;
    });

    this.theme = this.themeService.getTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Toggle FAQ
  activeID: number = 0;
  toggleFAQ(id: number): void {
    this.activeID = this.activeID === id ? 0 : id;
  }

  faqs = [
    {
      id: 1,
      question: "What is linkstorage and how does it work?",
      answer:
        "Our website is a link storing tool that allows you to archive your links you want to revisit. Save any URLs with previews and other features!",
    },

    {
      id: 2,
      question: "Is my personal information or data shared?",
      answer:
        "No, your personal information or data will never be shared with third parties. We prioritize the security and privacy of your information.",
    },

    {
      id: 3,
      question: "Is there a browser extension for linkstorage?",
      answer:
        "Not yet, but we plan on developing a browser extension that saves all the current tabs on your browser into your account. Stay tuned for updates on this feature!",
    },

    {
      id: 4,
      question: "What features are available on linkstorage?",
      answer:
        "LinkStorage offers a range of features including filtering by visits, name, date, searching, thumbnail previews, and folders.",
    },

    {
      id: 5,
      question: "Any restriction on types of links can I save?",
      answer:
        "There are no restrictions on the types of links you can save. You can save anything, including links to websites, articles, videos, and more.",
    },

    {
      id: 6,
      question: "Can I share my folders/links to others?",
      answer:
        "Yes, you can generate shareable links for your folders publicly or privately behind a password for others.",
    },

    {
      id: 7,
      question: "How can I suggest features/improvements?",
      answer:
        "We value your input! To suggest new features or improvements for LinkStorage, please visit our Contact Section below or through github. We're always eager to hear your ideas and make our platform even better based on user feedback.",
    },
  ];
}
