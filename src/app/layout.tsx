import "./globals.css";
import Navbar from "./components/Navbar";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";

export const metadata = {
  title: {
    default: 'GoalGetter',
    template: '%s | GoalGetter',
  },
};

export default async function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
    const session = await getServerSession(authOptions);

    return (
        <html lang="en">
            <body>
                <Providers session={session}>
                    <Navbar />
                    <main>{children}</main>
                </Providers>
            </body>
        </html>
    );
}
