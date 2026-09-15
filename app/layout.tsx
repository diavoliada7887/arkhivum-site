import { sitePath } from "./site-path";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Архивум — оцифровка архивов, книг и газет",
    template: "%s — Архивум",
  },
  description:
    "Оцифровка книг, газет, карт и архивных документов. Упорядочивание, переплёт, OCR, базы данных и загрузка во внешние системы.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: sitePath("/favicon.svg"),
    shortcut: sitePath("/favicon.svg"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
