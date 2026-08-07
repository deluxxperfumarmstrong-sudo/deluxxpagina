import Wordmark from "@/components/layout/Wordmark";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 gap-10">
      <Wordmark size="sm" />
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl text-on-background mb-8 text-center">
          Panel de administración
        </h1>
        <LoginForm next={next ?? "/admin/productos"} />
      </div>
    </div>
  );
}
