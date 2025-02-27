import Post from "./AllPost.jsx";
import PostSkeleton from "../skeletons/PostSkeleton.jsx";
import { useQuery } from "@tanstack/react-query"
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {

	const getEndPoint = () => {
		switch (feedType) {
			case "forYou":
				return "/api/posts/all";
			case "following":
				return "/api/posts/following";
			case "posts":
				return `/api/posts/userPost/${username}`;
			case "likes":
				return `/api/posts/likedPost/${userId}`;
			default:
				return "/api/posts/all";
		}
	}

	const POST_ENDPOINT = getEndPoint();

	const { data: postData, isLoading, error, refetch, isRefetching } = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await axios.get(POST_ENDPOINT);

				if (res.status !== 200) {
					throw new Error(error)
				}
				return res.data

			} catch (error) {
				toast.error(error.message || "Unable to load posts.")
			}
		}
	})

	useEffect(() => {
		refetch();
	}, [refetch, feedType,username])

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && postData?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && postData && (
				<div>
					{postData.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;