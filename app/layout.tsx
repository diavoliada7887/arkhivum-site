import { sitePath } from "./site-path";
import type { Metadata } from "next";
import "./globals.css";
import "./software/solutions.css";

export const metadata: Metadata = {
  title: {
    default: "Архивум — оцифровка, данные и программные решения",
    template: "%s — Архивум",
  },
  description:
    "Оцифровка и архивные технологии. Обработка данных, автоматизация документов и рабочих процессов, разработка прикладных программных решений.",
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
