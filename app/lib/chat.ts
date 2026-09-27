import api from "./api"

// მომხმარებელთან საუბრის გახსნა (ან არსებულის პოვნა) -> საუბრის ID
export async function openConversation(userId: string): Promise<string> {
  const res = await api.post(`/messages/conversation/${userId}`)
  return res.data.data._id
}
