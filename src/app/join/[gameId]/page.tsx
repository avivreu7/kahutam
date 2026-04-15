// This route is no longer the main entry point.
// All registration now happens on the home page (/).
import { redirect } from "next/navigation";

export default function JoinRedirect() {
  redirect("/");
}
