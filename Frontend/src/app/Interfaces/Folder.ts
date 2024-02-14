import { Link, Links } from "./Link";

export interface Folders {
  folders: Folder[];
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
  links: Links;
}
