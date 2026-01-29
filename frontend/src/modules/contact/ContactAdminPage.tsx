export function ContactAdminPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface relative overflow-hidden rounded-[28px] border border-white/10 p-8">
        <div className="absolute -right-10 top-6 h-40 w-40 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Liên hệ quản trị</p>
          <h1 className="display-font text-3xl font-semibold text-white md:text-4xl">
            Liên hệ đội ngũ quản trị
          </h1>
          <p className="max-w-2xl text-sm text-white/70 md:text-base">
            Nếu cần hỗ trợ nhanh, hãy liên hệ qua Facebook/Messenger. Team sẽ phản hồi sớm nhất.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card-neo rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Trang Facebook</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Connect.EXE</h3>
          <p className="mt-2 text-sm text-white/60">
            Theo dõi thông báo mới và gửi câu hỏi trực tiếp.
          </p>
          <a
            href="https://www.facebook.com/profile.php?id=61581595885701"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white"
          >
            Truy cập Facebook
          </a>
        </div>

        <div className="card-neo rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Messenger</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Chat trực tiếp</h3>
          <p className="mt-2 text-sm text-white/60">
            Gửi tin nhắn cho admin để được hỗ trợ nhanh.
          </p>
          <a
            href="https://m.me/61581595885701"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80"
          >
            Mở Messenger
          </a>
        </div>
      </section>
    </div>
  )
}
