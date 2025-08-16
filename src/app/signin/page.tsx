import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/lib/authOptions";
import SignInForm from "./SignInForm";

export default async function SignIn() {
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
        redirect("/");
    }

    return <SignInForm />;
}
