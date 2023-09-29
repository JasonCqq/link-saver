export interface Links {
  links: Link[];
}

export interface Link {
  id: number;
  userId: string | null;
  url: string;
  folderId: string | null;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  bookmarked: boolean;
  thumbnail: string;
  remind: Date | null;
  trash: boolean | null;
}
