import type { NextApiRequest, NextApiResponse } from "next";
import Mailgun from "mailgun-js";
import Mailgen from "mailgen";

const API_KEY = process.env.API_KEY_MAILGUN || "";
const DOMAIN = process.env.SANDBOX_DOMAIN || "";

const mailgen = new Mailgen({
  theme: "default",
  product: {
    name: "Spark! Bytes",
    link: "https://sparkbytes.com",
  },
});

const mailgun = new Mailgun({
  apiKey: API_KEY,
  domain: DOMAIN,
});

type Data = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const body = req.body || {};
  const intro = body.intro || "";
  const content = body.content || "";

  const email = {
    body: {
      name: body.name || "User",
      intro,
      outro: content,
    },
  };

  try {
    await mailgun.messages().send({
      to: body.to,
      from: `Spark! Bytes <no-reply@bu.edu>`,
      subject: body.subject || "Email",
      template: "spark-bytes notification", 
        'h:X-Mailgun-Variables': JSON.stringify({
        intro: intro,
        recipient_name: body.name,
        main_message: body.content,
        action_url: body.link,
        action_label: "View Details",
        outro: "Thank you for using Spark! Bytes!",
  })

    });

    return res
      .status(200)
      .json({ success: true, message: "Notification sent successfully." });
  } catch (e) {
    console.error("Mailgun error:", e);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send notification." });
  }
}



