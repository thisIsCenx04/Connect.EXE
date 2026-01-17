// About module constants

// Import team member images
import imgNKN from '../../assets/NKN.jpg'
import imgNHAT from '../../assets/NHAT.jpg'
import imgLTTA from '../../assets/LTTA.jpg'
import imgBVTT from '../../assets/BVTT.jpg'
import imgNTD from '../../assets/NTD.jpg'

// Team member interface
export interface TeamMember {
  name: string
  role: string
  image: string
}

// Team members data
export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Nghê Kim Ngân',
    role: 'CEO',
    image: imgNKN,
  },
  {
    name: 'Nguyễn Hoàng Anh Tuấn',
    role: 'Chief Design Officer',
    image: imgNHAT,
  },
  {
    name: 'Lê Tô Thái An',
    role: 'Chief Product Officer',
    image: imgLTTA,
  },
  {
    name: 'Bùi Võ Trung Tín',
    role: 'Chief Technology Officer',
    image: imgBVTT,
  },
  {
    name: 'Nguyễn Thùy Dung',
    role: 'Chief Communications Officer',
    image: imgNTD,
  },
]

// About page section content
export const ABOUT_SECTIONS = {
  about: {
    title: 'Về Chúng Tôi',
    description: [
      'Nhóm chúng tôi gồm 5 thành viên lần lượt là: Nghê Kim Ngân - Trưởng nhóm đóng vai trò là một CEO, Nguyễn Hoàng Anh Tuấn - Chief Design Officer, Lê Tô Thái An - Chief Product Officer, Bùi Võ Trung Tín - Chief Technology Officer và Nguyễn Thùy Dung - Chief Communications Officer.',
      'Chúng tôi cùng nhau hợp tác trong môn học EXE của trường Đại học FPT Cần Thơ để xây dựng nền tảng Connect.EXE với mục tiêu kết nối cộng đồng sinh viên tham gia bộ môn khởi nghiệp và thúc đẩy sự sáng tạo, đổi mới và phát triển bền vững.',
      'Với mong muốn phát triển và tiếp nối giá trị của bộ môn khởi nghiệp, chúng tôi cam kết xây dựng một nền tảng trực tuyến thân thiện, dễ sử dụng và cung cấp các công cụ hữu ích để hỗ trợ sinh viên trong hành trình khởi nghiệp của mình.',
    ],
  },
  team: {
    title: 'Thành viên nhóm',
  },
  vision: {
    title: 'Tầm Nhìn và Sứ Mệnh',
    content: [
      'Tầm nhìn của chúng tôi là trở thành nền tảng hàng đầu kết nối và hỗ trợ cộng đồng sinh viên khởi nghiệp, nơi mà ý tưởng sáng tạo được nuôi dưỡng và phát triển thành những dự án thực tế có tác động tích cực đến xã hội.',
      'Sứ mệnh của chúng tôi là cung cấp một môi trường trực tuyến thân thiện và hỗ trợ, nơi sinh viên có thể chia sẻ ý tưởng, học hỏi từ nhau và nhận được sự hỗ trợ cần thiết để biến ý tưởng thành hiện thực. Chúng tôi cam kết thúc đẩy sự sáng tạo, đổi mới và phát triển bền vững trong cộng đồng sinh viên khởi nghiệp.',
    ],
  },
} as const
