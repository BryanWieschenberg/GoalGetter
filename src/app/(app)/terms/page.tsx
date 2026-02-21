export default function TermsOfService() {
    return (
        <div className="flex-1 overflow-y-auto bg-white dark:bg-black text-zinc-800 dark:text-zinc-200">
            <div className="max-w-4xl mx-auto px-6 pt-16 pb-32">
                <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
                <p className="mb-8 text-zinc-500">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
                <div className="space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">1. Acceptance of Terms</h2>
                        <p className="leading-relaxed">
                            By accessing or using GoalGetter, you agree to be bound by these Terms
                            of Service.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">2. User Accounts</h2>
                        <p className="leading-relaxed">
                            You must provide accurate and complete information when creating an
                            account. You are responsible for safeguarding your password and for all
                            activities that occur under your account.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">3. Acceptable Use</h2>
                        <p className="leading-relaxed">
                            You agree not to use the service for any unlawful purpose or in any way
                            that interrupts, damages, or impairs the service.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">4. Termination</h2>
                        <p className="leading-relaxed">
                            We may terminate or suspend your account immediately, without prior
                            notice or liability, for any reason, including without limitation if you
                            breach the Terms.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">5. Changes to Terms</h2>
                        <p className="leading-relaxed">
                            We reserve the right to modify these terms at any time. We will notify
                            you of any changes by posting the new Terms on this page.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
