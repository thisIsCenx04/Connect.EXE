import { Link, Outlet, useLocation } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function AuthLayout() {
  const location = useLocation()
  const authCopy = {
    '/login': {
      title: 'Đăng nhập',
      subtitle: 'Chào mừng quay lại, vui lòng đăng nhập tài khoản của bạn.',
    },
    '/register': {
      title: 'Đăng ký',
      subtitle: 'Tạo tài khoản để bắt đầu xây dựng câu chuyện khởi nghiệp của bạn.',
    },
    '/forgot-password': {
      title: 'Đặt lại mật khẩu',
      subtitle: 'Chúng tôi sẽ gửi liên kết đặt lại mật khẩu đến email của bạn.',
    },
    '/reset-password': {
      title: 'Mật khẩu mới',
      subtitle: 'Chọn mật khẩu mạnh cho tài khoản của bạn.',
    },
    '/verify-email': {
      title: 'Xác thực email',
      subtitle: 'Xác nhận email để mở khóa đầy đủ quyền truy cập.',
    },
    '/oauth2/callback': {
      title: 'Đang xác thực',
      subtitle: 'Đang hoàn tất đăng nhập an toàn.',
    },
  } as const
  const copy = authCopy[location.pathname as keyof typeof authCopy] ?? authCopy['/login']

  return (
    <div className="page-shell relative flex min-h-screen items-center justify-center px-6 py-12 text-white">
      <div className="app-sheen" aria-hidden="true" />
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[rgba(20,22,45,0.75)] via-[rgba(25,28,55,0.7)] to-[rgba(35,25,60,0.65)] shadow-2xl backdrop-blur-xl">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
          {/* Left side - Form */}
          <div className="space-y-6 px-12 py-12 sm:px-16 sm:py-14">
            <Link to="/" aria-label="Về trang chủ" className="inline-flex items-center">
              <Logo size="sm" />
            </Link>
            <div>
              <h1 className="text-5xl font-bold text-white">{copy.title}</h1>
              <p className="mt-3 text-sm font-medium text-white/60">{copy.subtitle}</p>
            </div>
            <div className="w-full">
              <Outlet />
            </div>
          </div>
          {/* Right side - Image */}
          <div className="hidden items-center justify-center p-4 lg:flex">
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1663970206512-9d785d57b5dd?w=800&auto=format&fit=crop&q=100"
                alt="Bảng mạch điện"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
