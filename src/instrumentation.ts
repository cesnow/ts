export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { updateSentryRelease } = await import('./instrumentation-sourcemap');
    await updateSentryRelease();
  }
}
