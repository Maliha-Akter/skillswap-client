import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Skill Swap",
    template: "%s | Skill Swap",
  },
  description:
    "A freelance micro-task platform connecting clients with skilled freelancers for secure project collaboration and payments.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* <Navbar></Navbar> */}
        <main className="grow flex flex-col">{children}</main>
        {/* <Footer></Footer> */}
        <ToastContainer richColors theme="dark" position="top-right" />
      </body>
    </html>
  );
}
