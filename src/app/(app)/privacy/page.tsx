export default function PrivacyPolicy() {
    return (
        <div className="flex-1 overflow-y-auto bg-white dark:bg-black text-zinc-800 dark:text-zinc-200">
            <div className="max-w-4xl mx-auto px-6 pt-16 pb-32">
                <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
                <p className="mb-8 text-zinc-500">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
                <div className="space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">1. Information We Collect</h2>
                        <p className="leading-relaxed">
                            We collect information you provide directly to us when you create an
                            account, such as your email address and username.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">
                            2. How We Use Your Information
                        </h2>
                        <p className="leading-relaxed">
                            We use the information we collect to provide, maintain, and improve our
                            services, including authentication.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">3. Information Sharing</h2>
                        <p className="leading-relaxed">
                            We do not share your personal information with third parties except as
                            necessary to provide our services or as required by law.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">4. Data Security</h2>
                        <p className="leading-relaxed">
                            We take reasonable measures to help protect your personal information
                            from loss, theft, misuse, unauthorized access, disclosure, alteration,
                            and destruction.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">5. Contact Us</h2>
                        <p className="leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us
                            at{" "}
                            <a
                                href={`mailto:${process.env.SUPPORT_EMAIL}`}
                                className="text-blue-500"
                            >
                                {process.env.SUPPORT_EMAIL}
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
