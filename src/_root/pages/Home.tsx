import PostCard from "@/components/shared/PostCard";
import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { ClipLoader } from "react-spinners";

const Home = () => {
  const {
    data: posts,
    isPending: isPostLoading,
    isError: isPostError,
  } = useGetRecentPosts();

  return (
      <div className="flex flex-1">
        <div className="home-container">
          <div className="home-posts">
            <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
            {isPostError && (
                <div className="text-red-500">
                  There was an error loading the posts. Please try again later.
                </div>
            )}
            {isPostLoading && !posts ? (
                <ClipLoader color="#F93051" />
            ) : (
                <ul className="flex flex-col flex-1 gap-9 w-full">
                  {posts?.documents.map((post: Models.Document) => (
                      <PostCard post={post} key={post.$id} />
                  ))}
                </ul>
            )}
          </div>
        </div>
      </div>
  );
};

export default Home;
