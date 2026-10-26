import nodemailer from 'nodemailer';

export type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  website?: string;
  service: string;
  details: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
};

export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 465);
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === 'true'
      : port === 465;

  const fromAddress = process.env.MAIL_FROM?.trim() || user;
  const to = process.env.MAIL_TO?.trim() || 'admin@crolane.in';

  return { host, port, secure, user, pass, from: fromAddress, to };
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildText(payload: ContactPayload, serviceName: string): string {
  return [
    'New enquiry from the CROLANE website',
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Company: ${payload.company?.trim() || 'Not provided'}`,
    `Website: ${payload.website?.trim() || 'Not provided'}`,
    `Service interest: ${serviceName}`,
    '',
    'Project details:',
    payload.details,
    '',
    '---',
    'Sent from the contact form at crolane.in',
  ].join('\n');
}

function buildHtml(payload: ContactPayload, serviceName: string): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#7a7a85;font:11px/1.4 ui-monospace,monospace;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;">${label}</td>` +
    `<td style="padding:6px 0;color:#16161b;font:15px/1.55 -apple-system,sans-serif;">${escapeHtml(value)}</td></tr>`;

  return [
    '<div style="background:#f4f1ea;padding:28px;font-family:-apple-system,sans-serif;">',
    '<div style="background:#fff;border:1px solid #e4e1da;border-radius:14px;padding:26px;max-width:600px;">',
    '<p style="margin:0 0 18px;font:11px ui-monospace,monospace;letter-spacing:0.14em;text-transform:uppercase;color:#7a7a85;">New website enquiry</p>',
    '<table style="border-collapse:collapse;width:100%;">',
    row('Name', payload.name),
    row('Email', payload.email),
    row('Company', payload.company?.trim() || 'Not provided'),
    row('Website', payload.website?.trim() || 'Not provided'),
    row('Service', serviceName),
    '</table>',
    '<hr style="border:none;border-top:1px solid #e4e1da;margin:16px 0;">',
    '<p style="margin:0 0 8px;font:11px ui-monospace,monospace;letter-spacing:0.14em;text-transform:uppercase;color:#7a7a85;">Project details</p>',
    `<p style="margin:0;white-space:pre-wrap;color:#16161b;font:15px/1.6 -apple-system,sans-serif;">${escapeHtml(payload.details)}</p>`,
    '</div></div>',
  ].join('');
}

export async function sendContactEmail(payload: ContactPayload, serviceName: string) {
  const config = getSmtpConfig();
  if (!config) {
    const err = new Error('SMTP is not configured');
    (err as Error & { code?: string }).code = 'SMTP_NOT_CONFIGURED';
    throw err;
  }

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  await transport.sendMail({
    from: config.from,
    to: config.to,
    replyTo: `"${payload.name.replace(/["\\\r\n]/g, '')}" <${payload.email}>`,
    subject: `Website enquiry: ${serviceName} - ${payload.name.slice(0, 60)}`,
    text: buildText(payload, serviceName),
    html: buildHtml(payload, serviceName),
  });
}
