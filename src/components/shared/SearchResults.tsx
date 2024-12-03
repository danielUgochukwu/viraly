import { Models } from "appwrite";
import { ClipLoader } from "react-spinners";
import GridPostList from "./GridPostList";

type SearchResultsProps = {
  isSearchFetching: boolean;
  searchedPosts: Models.Document[];
};

const SearchResults = ({
  isSearchFetching,
  searchedPosts,
}: SearchResultsProps) => {
  if (isSearchFetching) return <ClipLoader color="#F93051" />;

  if (searchedPosts && searchedPosts.documents.length > 0) {
    return <GridPostList posts={searchedPosts.documents} />;
  } else {
    return (
        <p className="text-light-4 mt-10 text-center w-full">No results found</p>
    );
  }
};

export default SearchResults;
