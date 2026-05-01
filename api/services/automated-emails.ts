import nodemailer from "nodemailer";
import { config } from "../config";
import { storage } from "../storage";

const transporter = nodemailer.createTransport({
  service: config.email.service || "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});
import { db } from "../db";
import { users } from "../../shared/models/auth";
import { eq, and, gte, lte, sql } from "drizzle-orm";

interface EmailTemplate {
  subject: string;
  body: string;
}

const templates: Record<string, EmailTemplate> = {
  welcome: {
    subject: "Welcome to WCCRM Lagos!",
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to WCCRM Lagos!</h1>
          </div>
          <div class="content">
            <p>Dear {{firstName}},</p>
            <p>Welcome to the Watchman Catholic Charismatic Renewal Movement Lagos family! We're thrilled to have you join us.</p>
            <p>Here are some things you can do:</p>
            <ul>
              <li>Browse our upcoming events</li>
              <li>Watch past sermons</li>
              <li>Connect with your house cell group</li>
              <li>Give online</li>
            </ul>
            <p>If you have any questions, don't hesitate to reach out to us.</p>
            <p>God bless you!</p>
            <p>WCCRM Lagos Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} WCCRM Lagos. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  eventReminder: {
    subject: "Reminder: {{eventTitle}}",
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .event-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Event Reminder</h1>
          </div>
          <div class="content">
            <p>Dear {{firstName}},</p>
            <p>This is a friendly reminder about an upcoming event:</p>
            <div class="event-details">
              <h3>{{eventTitle}}</h3>
              <p><strong>Date:</strong> {{eventDate}}</p>
              <p><strong>Location:</strong> {{eventLocation}}</p>
              <p>{{eventDescription}}</p>
            </div>
            <p>We look forward to seeing you there!</p>
            <p>God bless!</p>
            <p>WCCRM Lagos Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} WCCRM Lagos. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  birthday: {
    subject: "Happy Birthday from WCCRM Lagos!",
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; text-align: center; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎂 Happy Birthday!</h1>
          </div>
          <div class="content">
            <p>Dear {{firstName}},</p>
            <p>Happy birthday from the WCCRM Lagos family!</p>
            <p>May God bless you abundantly in this new year of your life.</p>
            <p>We celebrate you!</p>
            <p>God bless!</p>
            <p>WCCRM Lagos Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} WCCRM Lagos. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  attendanceFollowUp: {
    subject: "We Missed You at Church",
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>We Missed You!</h1>
          </div>
          <div class="content">
            <p>Dear {{firstName}},</p>
            <p>We noticed you weren't at our recent service and we missed you!</p>
            <p>We're here for you whenever you're ready to join us again.</p>
            <p>Here are our service times:</p>
            <ul>
              <li>Sunday: 7:00 AM & 9:00 AM</li>
              <li>Wednesday: 6:00 PM</li>
              <li>Friday: 7:00 PM</li>
            </ul>
            <p>God bless!</p>
            <p>WCCRM Lagos Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} WCCRM Lagos. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  weeklyDevotional: {
    subject: "Your Weekly Devotional - {{devotionalTitle}}",
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .verse { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; font-style: italic; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Weekly Devotional</h1>
          </div>
          <div class="content">
            <p>Dear {{firstName}},</p>
            <h2>{{devotionalTitle}}</h2>
            <div class="verse">
              <p>{{scripture}}</p>
            </div>
            <p>{{devotionalContent}}</p>
            <p>God bless you as you meditate on this word!</p>
            <p>WCCRM Lagos Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} WCCRM Lagos. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
};

function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

export async function sendWelcomeEmail(userId: string): Promise<void> {
  const user = await storage.getUserById(userId);
  if (!user || !user.email) return;

  const emailHtml = replacePlaceholders(templates.welcome.body, {
    firstName: user.firstName || "Brother/Sister",
  });

  await sendEmail({
    to: user.email,
    subject: templates.welcome.subject,
    html: emailHtml,
  });
}

export async function sendEventReminderEmail(
  userId: string,
  event: { title: string; date: Date; location: string; description: string }
): Promise<void> {
  const user = await storage.getUserById(userId);
  if (!user || !user.email) return;

  const emailHtml = replacePlaceholders(templates.eventReminder.body, {
    firstName: user.firstName || "Brother/Sister",
    eventTitle: event.title,
    eventDate: event.date.toLocaleDateString(),
    eventLocation: event.location,
    eventDescription: event.description,
  });

  await sendEmail({
    to: user.email,
    subject: replacePlaceholders(templates.eventReminder.subject, { eventTitle: event.title }),
    html: emailHtml,
  });
}

export async function sendBirthdayEmail(userId: string): Promise<void> {
  const user = await storage.getUserById(userId);
  if (!user || !user.email) return;

  const emailHtml = replacePlaceholders(templates.birthday.body, {
    firstName: user.firstName || "Brother/Sister",
  });

  await sendEmail({
    to: user.email,
    subject: templates.birthday.subject,
    html: emailHtml,
  });
}

export async function sendAttendanceFollowUp(userId: string): Promise<void> {
  const user = await storage.getUserById(userId);
  if (!user || !user.email) return;

  const emailHtml = replacePlaceholders(templates.attendanceFollowUp.body, {
    firstName: user.firstName || "Brother/Sister",
  });

  await sendEmail({
    to: user.email,
    subject: templates.attendanceFollowUp.subject,
    html: emailHtml,
  });
}

export async function sendWeeklyDevotionalEmail(
  userId: string,
  devotional: { title: string; scripture: string; content: string }
): Promise<void> {
  const user = await storage.getUserById(userId);
  if (!user || !user.email) return;

  const emailHtml = replacePlaceholders(templates.weeklyDevotional.body, {
    firstName: user.firstName || "Brother/Sister",
    devotionalTitle: devotional.title,
    scripture: devotional.scripture,
    devotionalContent: devotional.content,
  });

  await sendEmail({
    to: user.email,
    subject: replacePlaceholders(templates.weeklyDevotional.subject, { devotionalTitle: devotional.title }),
    html: emailHtml,
  });
}

async function sendEmail(params: { to: string; subject: string; html: string }): Promise<void> {
  try {
    await transporter.sendMail({
      from: config.email.from || `"WCCRM Lagos" <${config.email.user}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    console.log(`Email sent to ${params.to}: ${params.subject}`);
  } catch (error) {
    console.error(`Failed to send email to ${params.to}:`, error);
  }
}

export async function processScheduledEmails(): Promise<void> {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const allUsers = await storage.getAllUsers();

    for (const user of allUsers) {
      if (!user.email) continue;

      if (user.birthday) {
        const birthday = new Date(user.birthday);
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();
        const birthMonth = birthday.getMonth();
        const birthDate = birthday.getDate();

        if (todayMonth === birthMonth && todayDate === birthDate) {
          await sendBirthdayEmail(user.id);
        }
      }
    }

    console.log("Processed scheduled emails");
  } catch (error) {
    console.error("Error processing scheduled emails:", error);
  }
}
