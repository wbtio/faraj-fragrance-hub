import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">عذراً! الصفحة غير موجودة</p>
        <div className="flex flex-col gap-2">
          <Link to="/" className="text-primary hover:underline">
            العودة إلى الصفحة الرئيسية
          </Link>
          <Link to="/login" className="text-primary hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;