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
}