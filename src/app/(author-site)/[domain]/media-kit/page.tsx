import { redirect } from "next/navigation";

export default function MediaKitRedirect() {
  redirect("/about?tab=media-kit");
}
