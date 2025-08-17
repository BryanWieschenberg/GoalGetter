import * as React from "react";
import { Html, Head, Preview, Body, Container, Heading, Text, Hr } from "@react-email/components";

export default function SignupVerify({ username, link }: { username: string, link: string }) {
    return (
        <Html>
            <Head />
            <Preview>Welcome to GoalGetter</Preview>
            <Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" }}>
                <Container style={{ padding: "24px" }}>
                    <Heading style={{ margin: "0 0 12px" }}>Hey {username}, welcome! 🎉</Heading>
                    <Text>You're all set. Let's get productive.</Text>
                    <p>To verify your email, please click the link below:</p>
                    <p><a href={link}>{link}</a></p>
                    <Hr />
                    <Text style={{ color: "#666" }}>If this wasn't you, ignore this email.</Text>
                </Container>
            </Body>
        </Html>
    );
}
