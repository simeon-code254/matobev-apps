type Props = {
  role: "player"|"scout"|"admin"|string;
};

export default function Sidebar({ role }: Props) {
  return (
    <aside className="hidden md:block">
      <div className="sticky top-[72px] space-y-3">
        <a href="/upload" className="block rounded-xl bg-white border shadow p-3 hover:shadow-md transition">Upload Video</a>
        <a href="/feed" className="block rounded-xl bg-white border shadow p-3 hover:shadow-md transition">Feed</a>
        {role === "scout" && (
          <a href="/post-trial" className="block rounded-xl bg-white border shadow p-3 hover:shadow-md transition">Post Trial</a>
        )}
        <a href="/news" className="block rounded-xl bg-white border shadow p-3 hover:shadow-md transition">News Feed</a>
      </div>
    </aside>
  );
}
