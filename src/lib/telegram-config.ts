/** Telegram bot credentials (server-side only). Loaded from `.env`. */
export const telegramBotToken = process.env["TELEGRAM_BOT_TOKEN"] ?? "";
export const telegramChatId = process.env["TELEGRAM_CHAT_ID"] ?? "";

export function hasTelegramConfig(): boolean {
  return Boolean(telegramBotToken && telegramChatId);
}
