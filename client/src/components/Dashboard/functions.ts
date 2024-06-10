import Security from "../../helpers/functions";
import { supabase } from "../../supabase/supabaseClient";
import { postTypes, PostTypes } from "./Posts";

const security = new Security();

export async function getPrivateKey(userId : string) {
  const { data } = await supabase
    .from("wallets")
    .select("ethereum_private_address")
    .eq("id", userId)

  const privateKey = security.decrypt(data[0].ethereum_private_address);
  return privateKey;
}


export async function getPublicKey(userId : string) {
  const { data } = await supabase
    .from("wallets")
    .select("ethereum_address")
    .eq("id", userId)

  const publicKey = data[0].ethereum_address;
  return publicKey;
}


export async function downloadImage(path : string) {
  try {
    const { data, error } = await supabase.storage.from('avatars').download(path);
    if (error) {
      throw error;
    }
    const url = URL.createObjectURL(data);
    return url;
  } catch (error) {
    console.log('Error downloading image: ', error);
  }   
}


export const calculateCredit = (data: { time: string; amountPeople: string; rating: string; }, postType : keyof PostTypes) => {
  const numberOfHours = parseInt(data.time);
  const numberOfPeople = parseInt(data.amountPeople);
  const creditFromPostType = postTypes[postType];

  const credit : number = (creditFromPostType + numberOfHours) * (numberOfPeople + 1);
  return credit;
};