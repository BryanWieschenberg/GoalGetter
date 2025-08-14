"use client";

export default function SignUpPage() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
                <p className="mb-4">Please sign up to continue.</p>
                <form action="/api/auth/signin" method="post">
                    <input type="hidden" name="callbackUrl" value="/" />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                    >
                        Sign Up with Google
                    </button>
                </form>
            </div>
        </div>
    );
}
