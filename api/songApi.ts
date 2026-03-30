import { BASE_URL } from "../src/constants/config";

export const getSongs = async () => {
  const res = await fetch(BASE_URL + "api/getSongs.php");
  return await res.json();
};