import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import pool from "@/lib/db";
import authOptions from "@/lib/authOptions";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Resend } from "resend";
import EmailChangeVerify from "@/lib/templates/EmailChangeVerify";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 401 });
        }

        const { editType, newValue, password } = await req.json();

        if (!newValue || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (editType !== "email" && editType !== "username" && editType !== "handle") {
            return NextResponse.json({ error: "Invalid field" }, { status: 400 });
        }

        const data = await pool.query(
            "SELECT email, password FROM users WHERE id=$1",
            [session.user.id]
        );

        if (data.rowCount === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const ok = await bcrypt.compare(password, data.rows[0].password);

        if (!ok) {
            return NextResponse.json({ error: "Invalid password" }, { status: 403 });
        }
        
        if (editType === "username") {
            await pool.query(
                "UPDATE users SET username=$1 WHERE id=$2",
                [newValue, session.user.id]
            );
        } else if (editType === "handle") {
            const handleExists = await pool.query("SELECT id FROM users WHERE handle=$1", [newValue]);
            
            if (handleExists.rowCount) {
                return NextResponse.json({ error: "Handle already exists" }, { status: 409 });
            }

            await pool.query(
                "UPDATE users SET handle=$1 WHERE id=$2",
                [newValue, session.user.id]
            );
        } else if (editType === "email") {
            const emailExists = await pool.query("SELECT id FROM users WHERE email=$1", [newValue]);

            if (emailExists.rowCount) {
                return NextResponse.json({ error: "Email already exists" }, { status: 409 });
            }

            const tokenRes = await pool.query(
                `SELECT token FROM auth_tokens
                WHERE user_id=$1 AND purpose='email_change'`,
                [session.user.id]
            );

            const raw = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");

            const userRes = await pool.query("SELECT id, username FROM users WHERE email=$1", [data.rows[0].email]);
            if (tokenRes.rowCount) {
                await pool.query(
                    `UPDATE auth_tokens
                    SET token=$1, created_at=NOW(), expires_at=NOW() + interval '1 hour', pending_email
                    WHERE user_id=$2 AND purpose='email_change', $3`,
                    [tokenHash, session.user.id, newValue]
                );
            } else {
                await pool.query(
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

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
