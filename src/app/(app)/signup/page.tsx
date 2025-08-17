import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/lib/authOptions";
import SignUpForm from "./SignUpForm";

export default async function SignUp() {
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
        redirect("/");
    }

    return <SignUpForm />;
}
