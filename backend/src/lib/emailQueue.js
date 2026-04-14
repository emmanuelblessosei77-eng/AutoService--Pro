/**
 * Email Task Queue using pg-boss (PostgreSQL-backed)
 *
 * How it works:
 *  1. Call enqueueEmail({ to, subject, html, text }) to add a job to the queue
 *  2. pg-boss stores the job in a "pgboss.job" table in your PostgreSQL DB
 *  3. The worker (started in server.js) picks up jobs every few seconds
 *  4. If sending fails, pg-boss automatically retries up to 3 times
 *  5. Failed jobs are moved to a dead-letter queue for inspection
 */

const { PgBoss } = require('pg-boss');
const { sendEmail } = require('./mailer');

const QUEUE_NAME = 'send-email';

// Create boss instance using same DB connection as the rest of the app
const boss = new PgBoss({
  host:     process.env.PGHOST     || 'localhost',
  port:     parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'car_service_db',
  user:     process.env.PGUSER     || 'postgres',
  password: process.env.PGPASSWORD || '1234',
  // Retry failed jobs up to 3 times with exponential backoff
  retryLimit: 3,
  retryDelay: 30,       // seconds between retries
  retryBackoff: true,   // double delay on each retry (30s, 60s, 120s)
});

boss.on('error', (err) => console.error('📬 pg-boss error:', err.message));

/**
 * Start the queue and register the email worker.
 * Call this once from server.js on startup.
 */
async function startEmailQueue() {
  await boss.start();
  console.log('📬 Email queue started (pg-boss)');

  // Ensure the queue exists before registering a worker
  await boss.createQueue(QUEUE_NAME);
  console.log(`📬 Queue "${QUEUE_NAME}" ready`);

  // Register the worker that processes email jobs
  // pg-boss v10+ passes an array of jobs to the worker callback
  await boss.work(QUEUE_NAME, { teamSize: 5, teamConcurrency: 5 }, async (jobs) => {
    const jobList = Array.isArray(jobs) ? jobs : [jobs];
    for (const job of jobList) {
      const { to, subject, html, text } = job.data;
      console.log(`📧 Processing email job ${job.id} → ${to}`);
      await sendEmail({ to, subject, html, text });
      console.log(`✅ Email sent to ${to} (job ${job.id})`);
    }
  });

  console.log(`📬 Email worker registered for queue: "${QUEUE_NAME}"`);
}

/**
 * Add an email to the queue.
 * Returns immediately — does NOT wait for the email to send.
 *
 * @param {{ to: string, subject: string, html?: string, text?: string }} emailData
 * @returns {Promise<string>} job ID
 */
async function enqueueEmail(emailData) {
  if (!emailData.to || !emailData.subject) {
    throw new Error('enqueueEmail: "to" and "subject" are required');
  }

  const jobId = await boss.send(QUEUE_NAME, emailData, {
    retryLimit: 3,
    retryDelay: 30,
    retryBackoff: true,
    expireInHours: 24,  // discard job if not completed within 24 hours
  });

  console.log(`📬 Email queued for ${emailData.to} (job ${jobId})`);
  return jobId;
}

module.exports = { startEmailQueue, enqueueEmail };
