import postgres from 'postgres';

const MISSING_POSTGRES_URL_MESSAGE =
  'POSTGRES_URL is not set. Create .env.local with your Vercel Postgres variables, then restart the dev server.';

function createSqlClient() {
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error(MISSING_POSTGRES_URL_MESSAGE);
  }

  return postgres(connectionString, { ssl: 'require' });
}

async function listInvoices() {
  const sql = createSqlClient();

  try {
    const data = await sql`
      SELECT invoices.amount, customers.name
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE invoices.amount = 666;
    `;

    return data;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export async function GET() {
  try {
    return Response.json(await listInvoices());
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to execute query.',
      },
      { status: 500 },
    );
  }
}
