import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import pool from "@/lib/db";
import authOptions from "@/lib/authOptions";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Resend } from "resend";
import EmailChangeVerify from "@/lib/templates/EmailChangeVerify";

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const client = await pool.connect();
    let began = false;

    try {
        const { editType, newValue, password } = await req.json();
        
        if (!newValue) {
            return NextResponse.json({ error: "Missing new value" }, { status: 400 });
        }
        if (!["email", "username", "handle"].includes(editType)) {
            return NextResponse.json({ error: "Invalid field" }, { status: 400 });
        }

        const userRes = await client.query(
            "SELECT id, email, username, password, provider FROM users WHERE id=$1",
            [session.user.id]
        );
        if (userRes.rowCount === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = userRes.rows[0];
        const isLocal = !user.provider;
        
        if (isLocal) {
            if (!password) {
                return NextResponse.json({ error: "Password required" }, { status: 400 });
            }
            const ok = await bcrypt.compare(password, user.password);
            if (!ok) {
                return NextResponse.json({ error: "Invalid password" }, { status: 403 });
            }
        } else {
            if (editType === "email") {
                return NextResponse.json({ error: "OAuth accounts cannot change email" }, { status: 400 });
            }
        }
        
        if (editType === "handle" && newValue === user.handle) {
            return NextResponse.json({ error: "New handle cannot be the same as the current one." }, { status: 400 });
        }
        if (editType === "email" && newValue === user.email) {
            return NextResponse.json({ error: "New email cannot be the same as the current one." }, { status: 400 });
        }
        if (editType === "username" && newValue === user.username) {
            return NextResponse.json({ error: "New username cannot be the same as the current one." }, { status: 400 });
        }

        await client.query("BEGIN");
        began = true;
        
        if (editType === "username") {
            await client.query(
                "UPDATE users SET username=$1 WHERE id=$2",
                [newValue, session.user.id]
            );
        } else if (editType === "handle") {
            const handleExists = await client.query("SELECT id FROM users WHERE handle=$1", [newValue]);
            
            if (handleExists.rowCount) {
                return NextResponse.json({ error: "Handle already exists" }, { status: 409 });
            }

            await client.query(
                "UPDATE users SET handle=$1 WHERE id=$2",
                [newValue, session.user.id]
            );
        } else if (editType === "email") {
            const emailExists = await client.query("SELECT id FROM users WHERE email=$1", [newValue]);

            if (emailExists.rowCount) {
                return NextResponse.json({ error: "Email already exists" }, { status: 409 });
            }

            const tokenRes = await client.query(
                `SELECT token FROM auth_tokens
                WHERE user_id=$1 AND purpose='email_change'`,
                [session.user.id]
            );

            const raw = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");

            const userRes = await client.query("SELECT id, username FROM users WHERE email=$1", [user.email]);
            if (tokenRes.rowCount) {
                await client.query(
                    `UPDATE auth_tokens
                    SET token=$1, created_at=NOW(), expires_at=NOW() + interval '1 hour', pending_email
                    WHERE user_id=$2 AND purpose='email_change', $3`,
                    [tokenHash, session.user.id, newValue]
                );
            } else {
                await client.query(
                    `INSERT INTO auth_tokens (user_id, token, purpose, pending_email)
                    VALUES ($1, $2, 'email_change', $3)`,
                    [userRes.rows[0].id, tokenHash, newValue]
                );
            }

            const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
            const resend = new Resend(process.env.RESEND_API_KEY);
            const link = `${process.env.NEXT_PUBLIC_APP_URL}/email-change?token=${raw}`;
            
            await resend.emails.send({
                from: from,
                to: newValue,
                subject: "Verify Your Email Change",
                react: EmailChangeVerify({ username: userRes.rows[0].username, link: link }),
            });
        }

        await client.query("COMMIT");
        began = false;

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        if (began) { await client.query("ROLLBACK"); }
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    } finally {
        client.release();
    }
}
