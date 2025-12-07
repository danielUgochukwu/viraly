import { INewPost, INewUser, IUpdatePost } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { ID, ImageGravity, Query } from "appwrite";

// Create User
export async function createUserAccount(user: INewUser) {
  try {
    console.log("Attempting to create a new account...");
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw new Error("Failed to create a new account.");

    console.log("New account created successfully:", newAccount);

    const avatarUrl = avatars.getInitials(user.name);

    console.log("Attempting to save the user to the database...");
    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    console.log("User saved to the database:", newUser);

    return newUser;
  } catch (error) {
    console.error("Error during user account creation:", error);
    return error;
  }
}

// Save User To DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    console.log("Creating a new user document in the database...");
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    console.log("User document created successfully:", newUser);

    return newUser;
  } catch (error) {
    console.error("Error saving user to the database:", error);
  }
}

// Sign In
export async function signInAccount(user: { email: string; password: string }) {
  try {
    console.log("Attempting to sign in...");
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );

    console.log("User signed in successfully:", session);

    return session;
  } catch (error) {
    console.error("Error during sign-in:", error);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.error("Failed to get account:", error);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount)
      throw Error("No account found. User may not be signed in.");

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0) {
      throw Error("No user found in the database.");
    }

    return currentUser.documents[0];
  } catch (error) {
    console.error("Error retrieving current user:", error);
    return null;
  }
}

// Sign Out
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// Create Post
export async function createPost(post: INewPost) {
  try {
    // Upload image to storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error("Failed to upload the image.");

    // Get file URL
    const fileUrl = getFilePreview(uploadedFile.$id);

    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error("Failed to get the file URL.");
    }

    // convert tags to array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Save post to database
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl.href,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error("Failed to save the post to t");
    }

    return newPost;
  } catch (error) {
    console.log("Error creating post:", error);
  }
}

// Upload File
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log("Error uploading file:", error);
  }
}

// Get File Preview
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      ImageGravity.Top,
      100
    );

    if (!fileUrl) throw Error("Failed to get the file URL.");

    return fileUrl;
  } catch (error) {
    console.log("Error getting file preview:", error);
  }
}

// delete file
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log("Error deleting file:", error);
  }
}

// get recent posts
export async function getRecentPosts() {
  const posts = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [Query.orderDesc("$createdAt"), Query.limit(20)]
  );
  if (!posts) throw Error("Failed to retrieve the posts from the database.");

  return posts;
}

// like post
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw new Error("Failed to update post likes");

    return updatedPost;
  } catch (error) {
    console.error("Error in likePost:", error);
    throw error; // This will propagate the error to be caught by useMutation's onError handler
  }
}

// save post
export async function savePost(postId: string, userId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error("Failed to save the post in the database.");

    return updatedPost;
  } catch (error) {
    console.log("Error saving post:", error);
  }
}

// delete saved post
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error("Failed to delete saved post.");

    return { status: "ok" };
  } catch (error) {
    console.log("Error deleting saved post:", error);
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    return post;
  } catch (error) {
    console.log(error);
  }
}

// update post
export async function updatePost(post: IUpdatePost) {
  const hasFileUpdate = post.file.length > 0;
  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileUpdate) {
      // upload image to storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get file URL
      const fileUrl = getFilePreview(uploadedFile.$id);

      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error("Failed to get the file URL.");
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // convert tags to array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Save post to database
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      await deleteFile(post.imageId);
      throw Error("Failed to save the post to t");
    }

    return updatedPost;
  } catch (error) {
    console.log("Error updating post:", error);
  }
}

// delete post
export async function deletePost(postId: string, imageId: string) {
  if (!postId || !imageId) throw Error;

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    return { status: "ok" };
  } catch (error) {
    console.log("Error deleting saved post:", error);
  }
}

// Get Infinite Posts
export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc(`$updatedAt`), Query.limit(10)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// Search Posts
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// Example: Debugging the full user creation, sign-in, and retrieval process
export async function debugUserFlow(user: INewUser) {
  try {
    console.log("Starting the full user flow...");

    // Create a new user account
    const newUser = await createUserAccount(user);
    if (!newUser) throw new Error("User creation failed.");

    // Sign in with the new user account
    const session = await signInAccount({
      email: user.email,
      password: user.password,
    });
    if (!session) throw new Error("Sign-in failed.");

    // Get the current account details
    const accountDetails = await getAccount();
    if (!accountDetails) throw new Error("Failed to retrieve account details.");

    // Retrieve the current user from the database
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Failed to retrieve the current user.");

    console.log("Full user flow completed successfully:", currentUser);
  } catch (error) {
    console.error("Error during the full user flow:", error);
  }
}
