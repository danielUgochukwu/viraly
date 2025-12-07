// Existing types
export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: URL;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type LikePostParams = {
  postId: string;
  userId: string;
  action: "like" | "unlike";
};

// New types for posts and infinite query responses

// Define a type for a single post.
// Adjust the properties as needed to match your data.
export type Post = {
  $id: string;
  userId: string;
  caption: string;
  imageUrl: string;
  // You can add additional fields like createdAt, updatedAt, etc.
  createdAt?: string;
  updatedAt?: string;
};

// Define the response type returned by your API when fetching posts.
// This assumes your API returns an object with a `documents` array and a `total` count.
export type PostsResponse = {
  documents: Post[];
  total: number;
  // Include any other metadata from the API response if necessary.
};
