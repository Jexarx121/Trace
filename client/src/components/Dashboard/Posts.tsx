export interface Post {
  id: string,
  post_id: number,
  updated_at: Date,
  created_by: string,
  date_created: Date,
  date_finished: Date,
  title: string,
  type: string,
  description: string,
  contact: string,
  assigned_to: string,
  assigned_to_name: string,
  status: string,
  rating: number
};

export type PostTypes = {
  short: number,
  long: number;
}

export const postTypes : PostTypes = {
  "short": 5,
  "long" : 10
};

export const NoPostsFound = () => {
  return (
    <h1 className="text-center lg:col-span-2 text-5xl my-16 uppercase font-bold text-gray-400">No posts found</h1>
  );
}