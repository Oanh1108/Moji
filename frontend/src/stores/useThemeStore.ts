import type { ThemeState } from '@/types/store'
import { create } from 'zustand'

// persist dùng để lưu state xuống localStorage
// Nhờ vậy khi reload hoặc đóng/mở lại tab,
// theme vẫn được giữ lại
import { persist } from 'zustand/middleware'

// Tạo store quản lý theme sáng/tối
// ThemeState là kiểu dữ liệu của store này
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Giá trị mặc định ban đầu: false = light mode
      isDark: false,

      // Hàm dùng để đổi theme ngược lại hiện tại
      // Nếu đang sáng thì chuyển sang tối
      // Nếu đang tối thì chuyển sang sáng
      toggleTheme: () => {
        // Lấy giá trị isDark hiện tại rồi đảo ngược lại
        const newValue = !get().isDark

        // Cập nhật state trong zustand
        set({ isDark: newValue })

        // Nếu newValue = true thì bật dark mode
        if (newValue) {
          document.documentElement.classList.add("dark")
        } else {
          // Nếu newValue = false thì tắt dark mode
          document.documentElement.classList.remove("dark")
        }
      },

      // Hàm dùng để set theme trực tiếp
      // dark = true  => bật dark mode
      // dark = false => tắt dark mode
      setTheme: (dark: boolean) => {
        // Cập nhật state isDark
        set({ isDark: dark })

        // Thêm hoặc xóa class dark ở thẻ html
        if (dark) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      },
    }),
    {
      // Tên key lưu trong localStorage
      // Bạn sẽ thấy key này trong DevTools -> Application -> Local Storage
      name: "theme-storage",
    }
  )
)