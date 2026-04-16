import postgres from 'postgres';

function createSqlClient() {
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error(
      'POSTGRES_URL is not set. Add your Vercel Postgres environment variables to .env first.',
    );
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
