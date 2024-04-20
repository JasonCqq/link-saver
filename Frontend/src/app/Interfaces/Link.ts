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
  updatedAt: Date;
  bookmarked: boolean;
  thumbnail: {
    type: string;
    data: Number[];
    newUrl: string;
  };
  remind: Date | null;
  trash: boolean | null;
}
