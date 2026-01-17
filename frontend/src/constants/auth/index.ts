// Auth module constants

// Auth page section content
export const AUTH_SECTIONS = {
  login: {
    title: 'Đăng nhập',
    usernamePlaceholder: 'User Name',
    passwordPlaceholder: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    submitButton: 'Đăng nhập',
    googleButton: 'Đăng nhập với Google',
    noAccount: 'Chưa có tài khoản?',
    registerLink: 'Đăng ký ngay',
    errors: {
      emailNotVerified: 'Please verify your email before logging in.',
      loginFailed: 'Login failed. Please check your credentials.',
    },
  },
  register: {
    title: 'Đăng ký',
    fullNamePlaceholder: 'Họ và tên',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Mật khẩu',
    confirmPasswordPlaceholder: 'Xác nhận mật khẩu',
    submitButton: 'Đăng ký',
    googleButton: 'Đăng ký với Google',
    hasAccount: 'Đã có tài khoản?',
    loginLink: 'Đăng nhập',
    success: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
    errors: {
      passwordMismatch: 'Mật khẩu không khớp.',
      registrationFailed: 'Đăng ký thất bại. Vui lòng thử lại.',
    },
  },
  forgotPassword: {
    title: 'Quên mật khẩu',
    description: 'Nhập email của bạn để nhận link đặt lại mật khẩu.',
    emailPlaceholder: 'Email',
    submitButton: 'Gửi link đặt lại',
    backToLogin: 'Quay lại đăng nhập',
    success: 'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.',
    errors: {
      emailNotFound: 'Email không tồn tại trong hệ thống.',
      sendFailed: 'Gửi email thất bại. Vui lòng thử lại.',
    },
  },
  resetPassword: {
    title: 'Đặt lại mật khẩu',
    newPasswordPlaceholder: 'Mật khẩu mới',
    confirmPasswordPlaceholder: 'Xác nhận mật khẩu mới',
    submitButton: 'Đặt lại mật khẩu',
    success: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.',
    errors: {
      passwordMismatch: 'Mật khẩu không khớp.',
      resetFailed: 'Đặt lại mật khẩu thất bại. Link có thể đã hết hạn.',
    },
  },
  verifyEmail: {
    title: 'Xác thực email',
    verifying: 'Đang xác thực email...',
    success: 'Email đã được xác thực thành công! Bạn có thể đăng nhập ngay.',
    errors: {
      verifyFailed: 'Xác thực email thất bại. Link có thể đã hết hạn.',
    },
  },
} as const

// OAuth callback messages
export const OAUTH_MESSAGES = {
  processing: 'Đang xử lý đăng nhập...',
  success: 'Đăng nhập thành công!',
  error: 'Đăng nhập thất bại. Vui lòng thử lại.',
} as const
