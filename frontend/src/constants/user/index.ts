// User module constants

// User page section content
export const USER_SECTIONS = {
  profile: {
    title: 'Hồ sơ cá nhân',
    editButton: 'Chỉnh sửa',
    saveButton: 'Lưu thay đổi',
    cancelButton: 'Hủy',
    fields: {
      fullName: 'Họ và tên',
      email: 'Email',
      phone: 'Số điện thoại',
      bio: 'Giới thiệu bản thân',
      avatar: 'Ảnh đại diện',
    },
    placeholders: {
      fullName: 'Nhập họ và tên',
      phone: 'Nhập số điện thoại',
      bio: 'Viết vài dòng giới thiệu về bản thân...',
    },
    success: 'Cập nhật hồ sơ thành công!',
    errors: {
      updateFailed: 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.',
    },
  },
  changePassword: {
    title: 'Đổi mật khẩu',
    currentPasswordLabel: 'Mật khẩu hiện tại',
    newPasswordLabel: 'Mật khẩu mới',
    confirmPasswordLabel: 'Xác nhận mật khẩu mới',
    submitButton: 'Đổi mật khẩu',
    success: 'Đổi mật khẩu thành công!',
    errors: {
      currentPasswordWrong: 'Mật khẩu hiện tại không đúng.',
      passwordMismatch: 'Mật khẩu mới không khớp.',
      changeFailed: 'Đổi mật khẩu thất bại. Vui lòng thử lại.',
    },
  },
  kyc: {
    title: 'Xác thực danh tính (KYC)',
    description: 'Hoàn thành xác thực danh tính để mở khóa đầy đủ tính năng của nền tảng.',
    steps: {
      personalInfo: 'Thông tin cá nhân',
      idDocument: 'Giấy tờ tùy thân',
      verification: 'Xác thực',
    },
    fields: {
      fullName: 'Họ và tên đầy đủ',
      dateOfBirth: 'Ngày sinh',
      idNumber: 'Số CMND/CCCD',
      idFront: 'Ảnh mặt trước CMND/CCCD',
      idBack: 'Ảnh mặt sau CMND/CCCD',
      selfie: 'Ảnh selfie cầm CMND/CCCD',
    },
    submitButton: 'Gửi xác thực',
    status: {
      pending: 'Đang chờ xác thực',
      verified: 'Đã xác thực',
      rejected: 'Bị từ chối',
    },
    success: 'Gửi yêu cầu xác thực thành công! Chúng tôi sẽ xem xét trong 24-48 giờ.',
    errors: {
      submitFailed: 'Gửi xác thực thất bại. Vui lòng thử lại.',
    },
  },
} as const
