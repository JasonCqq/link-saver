export interface Links {
  links: Link[];
}

export interface Link {
  id: string;
  userId: string | null;
  url: string;
  folderId: string | null;
  title: string;
  createdAt: Date;
  bookmarked: boolean;
  thumbnail: string;
  pURL: string;
  trash: boolean | null;
  visits: number;
}
