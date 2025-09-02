import ClientVerify from "./ClientVerify";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const sp = await Promise.all([searchParams]);
    const tokenParam = sp[0]?.token;
    const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

    return <ClientVerify token={token} />;
}
