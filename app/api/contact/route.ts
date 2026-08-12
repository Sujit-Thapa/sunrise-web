import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
};

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ContactBody | null;

  const name = clean(body?.name);
  const email = clean(body?.email);
  const message = clean(body?.message);

  if (!name || name.length < 2) {
    return NextResponse.json({ message: 'Please enter your name.' }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ message: 'Please enter a valid email address.' }, { status: 400 });
  }

  if (!message || message.length < 10) {
    return NextResponse.json({ message: 'Please enter a message with at least 10 characters.' }, { status: 400 });
  }

  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim();
  const contactToEmail = process.env.CONTACT_TO_EMAIL?.trim() || gmailUser;
  const contactFromName = process.env.CONTACT_FROM_NAME?.trim() || 'Sunrise Realestate';

  if (!gmailUser || !gmailAppPassword || !contactToEmail) {
    return NextResponse.json(
      {
        message:
          'Email is not configured. Add GMAIL_USER, GMAIL_APP_PASSWORD, and CONTACT_TO_EMAIL.',
      },
      { status: 500 },
    );
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${contactFromName}" <${gmailUser}>`,
      to: contactToEmail,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        '',
        'Message:',
        message,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin: 0 0 16px; font-size: 18px;">New contact form message</h2>
          <p style="margin: 0 0 8px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p style="margin: 16px 0 8px;"><strong>Message:</strong></p>
          <div style="white-space: pre-wrap; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">${escapeHtml(message)}</div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to send contact email:', error);
    return NextResponse.json(
      { message: 'Failed to send your message. Please try again later.' },
      { status: 500 },
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
