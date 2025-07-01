import "./globals.css";

export const metadata = {
  title: {
    default: 'GoalGetter',
    template: '%s | GoalGetter',
  },
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
