import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class Theme {
  constructor() {
    this.detectColorScheme();
  }

  private theme = new BehaviorSubject<string>("light");
  theme$ = this.theme.asObservable();

  setTheme(theme: string) {
    this.theme.next(theme);
    localStorage.setItem("theme", theme);
    this.applyTheme(theme);
  }

  getTheme(): string {
    return this.theme.value;
  }

  applyTheme(theme: string) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "default");
    } else if (theme === "dim") {
      document.documentElement.setAttribute("data-theme", "dim");
    }
  }

  detectColorScheme() {
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme) {
      this.setTheme(storedTheme);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      this.setTheme("dark");
    } else {
      this.setTheme("light");
    }
  }
}
