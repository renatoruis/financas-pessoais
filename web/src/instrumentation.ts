/**
 * Hook de arranque do Next: corre uma vez por processo do servidor. Na Vercel cada função arranca
 * a frio, por isso as migrações correm no build (`vercel-build`) e não aqui.
 * O `if` tem de envolver o import para o bundle edge (middleware) não incluir o Postgres.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs' && !process.env.VERCEL) {
    const { bootstrapDatabase } = await import('./composition/bootstrap');
    await bootstrapDatabase();
  }
}
