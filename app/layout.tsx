import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LevelUp - 游戏化成长系统",
  description: "游戏化生产力应用，让成长像游戏一样有趣。任务管理、等级系统、AI助手，一站式个人成长平台。",
  keywords: ["游戏化", "生产力", "任务管理", "个人成长", "习惯养成", "LevelUp"],
  authors: [{ name: "LevelUp Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LevelUp",
  },
  openGraph: {
    type: "website",
    title: "LevelUp - 游戏化成长系统",
    description: "游戏化生产力应用，让成长像游戏一样有趣",
    siteName: "LevelUp",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00d4ff" },
    { media: "(prefers-color-scheme: dark)", color: "#050a14" },
  ],
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* PWA Support */}
        <meta name="application-name" content="LevelUp" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LevelUp" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* iOS Splash Screen */}
        <link rel="apple-touch-startup-image" href="/splash.png" />
      </head>
      <body className={inter.className}>
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((registration) => {
                    console.log('SW registered:', registration.scope);
                  })
                  .catch((error) => {
                    console.log('SW registration failed:', error);
                  });
              });
            }
          `
        }} />
      </body>
    </html>
  )
}
