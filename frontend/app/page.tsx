import Link from "next/link";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Personal Notes Manager</h1>
      <Link href="/dashboard" className="mt-4 block text-blue-500">
        Go to Dashboard
      </Link>
    </div>
  );
}
