import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Heading,
    Text,
    Hr,
    Section,
    Button,
} from "@react-email/components";

export default function PasswordResetVerify({
    username,
    link,
}: {
    username: string;
    link: string;
}) {
    return (
        <Html>
            <Head />
            <Preview>Verify your email to reset your password</Preview>
            <Body style={{ backgroundColor: "#f6f6f6", fontFamily: "Arial, sans-serif" }}>
                <Container
                    style={{
                        maxWidth: "600px",
                        margin: "40px auto",
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        padding: "32px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    }}
                >
                    <Heading
                        style={{
                            fontSize: "22px",
                            fontWeight: "bold",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        Action Required: Verify Your Email to Reset Password
                    </Heading>

                    <Text style={{ fontSize: "16px", marginBottom: "16px" }}>
                        Hello {username},
                    </Text>
                    <Text style={{ fontSize: "16px", marginBottom: "24px" }}>
                        To reset your <strong>GoalGetter</strong> password, please verify your email
                        by clicking the button below:
                    </Text>

                    <Section style={{ textAlign: "center", marginBottom: "32px" }}>
                        <Button
                            href={link}
                            style={{
                                backgroundColor: "#16a34a",
                                color: "#ffffff",
                                padding: "12px 24px",
                                borderRadius: "6px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                textDecoration: "none",
                            }}
                        >
                            Verify Email
                        </Button>
                    </Section>

                    <Text style={{ fontSize: "14px", color: "#666", marginBottom: "0" }}>
                        If you did not request a password reset, please ignore this email.
                    </Text>

                    <Hr style={{ margin: "32px 0" }} />

                    <Text style={{ fontSize: "14px", color: "#999", textAlign: "center" }}>
                        Thank you for using GoalGetter!
                    </Text>
                </Container>

                <Text
                    style={{
                        fontSize: "12px",
                        color: "#999",
                        textAlign: "center",
                        marginTop: "20px",
                    }}
                >
                    This email was sent by GoalGetter. Please do not reply to this email.
                </Text>
            </Body>
        </Html>
    );
}
