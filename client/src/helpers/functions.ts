import { supabase } from "../supabase/supabaseClient";

export const capitalize = (str: string = "", lowerRest = true): string =>
  str.slice(0, 1).toUpperCase() +
  (lowerRest ? str.slice(1).toLowerCase() : str.slice(1));

export const truncateText = (text : string, maxLength : number) => {
  if (text.length > maxLength) {
    return `${text.slice(0, maxLength)}...`;
  };

  return text;
};

async function getUserFromId(userId: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('id', userId)
    
    if (error) {
      alert(error);
    }

    return data;

  } catch (error) {
    alert(error);
    return "No user found";
  }
};
