import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import providersData from "../../../../../assets/config/embeds.json";

interface Provider {
  provider_name: string;
  provider_url: string;
  query: string;
  link: string;
}

@Component({
  selector: "app-viewer",
  templateUrl: "./viewer.component.html",
  styleUrl: "./viewer.component.scss",
  standalone: false,
})
export class ViewerComponent implements OnInit {
  constructor() {}

  @Input() itemData: any;
  @Output() closeEmbedEmit = new EventEmitter();

  close() {
    this.closeEmbedEmit.emit();
  }

  providers: Provider[] = providersData;

  videoId: string = "";
  embedLink: string = "";
  fullLink: string = "";

  extractVideoId(url: string) {
    try {
      // Find matching provider
      const provider = providersData.find((p) => {
        const providerDomain = p.provider_url;

        return url.includes(providerDomain) || providerDomain.includes(url);
      });

      if (!provider) {
        return null;
      }

      // if (!provider.query) {
      //   this.videoId = this.itemData.url;
      //   // Check if it starts with http:// or https://
      //   let tempUrl;
      //   if (!/^https?:\/\//i.test(this.videoId)) {
      //     tempUrl = "https://" + url;
      //   }

      //   // Add www. if missing after the protocol
      //   tempUrl = tempUrl?.replace(/^(https?:\/\/)(?!www\.)/, "$1www.");

      //   this.embedLink = provider.link;
      //   this.fullLink = this.embedLink + tempUrl;
      //   console.log(this.fullLink);
      //   return null;
      // }

      // {
      //   "provider_name": "Reddit",
      //   "provider_url": "reddit.com",
      //   "query": "",
      //   "link": "https://publish.reddit.com/embed?url="
      // }

      if (provider.query) {
        const prefix = provider.query;
        const startIndex = url.indexOf(prefix);

        if (startIndex !== -1) {
          // Start after the prefix
          const afterPrefix = url.substring(startIndex + prefix.length);

          // End at '/' if it exists
          const endIndex = afterPrefix.indexOf("/");
          this.videoId =
            endIndex !== -1 ? afterPrefix.substring(0, endIndex) : afterPrefix;

          this.embedLink = provider.link;
          this.fullLink = this.embedLink + this.videoId;
          console.log(this.videoId, this.fullLink, this.embedLink);
        }
      }

      return null;
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
  }

  ngOnInit(): void {
    this.extractVideoId(this.itemData.url);
  }
}
