import { Component, OnDestroy, OnInit } from "@angular/core";
import { UserService } from "../user/user.service";
import { HomeService } from "./home.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  // Checks for user
  constructor(
    private userService: UserService,
    private homeService: HomeService,
  ) {}

  private destroy$ = new Subject<void>();

  user: any;
  data: any;

  videoShowcase: boolean = false;
  toggleShowcase() {
    this.videoShowcase = !this.videoShowcase;
  }

  ngOnInit() {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.user = user?.user;
    });

    this.homeService
      .getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.data = response;
      });
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
      question: "What is LinkStorage and how does it work?",
      answer:
        "Our website is a link saver tool that allows you to store and organize your favorite links you want to revisit all in one place. You can save URLs, search through your folders, and even preview the content of the links directly on our platform.",
    },

    {
      id: 2,
      question: "Is my personal information or data shared?",
      answer:
        "No, your personal information or data will never be shared with third parties. We prioritize the security and privacy of your information.",
    },

    {
      id: 3,
      question: "Is there a browser extension for LinkStorage?",
      answer:
        "Not yet, but we plan on developing a browser extension to enhance your LinkStorage experience. Stay tuned for updates on this feature!",
    },

    {
      id: 4,
      question: "What features are available on LinkStorage?",
      answer:
        "LinkStorage offers a range of features to streamline your link-saving process, including filtering options like searching, thumbnail screenshots for easy identification, reminders to keep you organized, and the ability to create folders for efficient categorization.",
    },

    {
      id: 5,
      question: "Any restriction on types of links can I save?",
      answer:
        "There are no restrictions on the types of links you can save in LinkStorage. You can save links to websites, articles, videos, and more, making it a versatile tool for all your link-saving needs.",
    },

    {
      id: 6,
      question: "Can I share my folders/links to others?",
      answer:
        "Absolutely! You have the ability to generate shareable links for your folders, allowing you to easily share collections of links with others.",
    },

    {
      id: 7,
      question: "How can I suggest features/improvements?",
      answer:
        "We value your input! To suggest new features or improvements for LinkStorage, please visit our Contact Section below. We're always eager to hear your ideas and make our platform even better based on user feedback.",
    },
  ];
}
