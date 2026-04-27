import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {z} from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import { useNavigate } from "react-router"
import { Label } from "../ui/label"
import { useAuthStore } from "@/stores/useAuthStore"

//- Mô tả điều kiện của form đăng kí
//- object : mk đang miêu tả đối tượng có nhiều trường, mỗi trường sẽ tương
//ứng với từng ô input trong form
const signUpSchema = z.object({
  firstname: z.string().min(1, 'Tên bắt buộc phải có'),
  lastname: z.string().min(1, 'Họ bắt buộc phải có'),
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 kí tự")
})

//infer => tự suy ra kiểu
//typeof => lấy kiểu dữ liệu của signUpSchema
type SignUpFormValues = z.infer<typeof signUpSchema>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {signUp} = useAuthStore();
  const navigate = useNavigate();

  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema)
  });

  const onSubmit = async (data: SignUpFormValues) => {
    //lấy các giá trị từ data
    const {firstname, lastname, username, email, password} = data;

    //gọi backend để signup
    await signUp(username, password, email, lastname, firstname);

    navigate("/signin");
  }
  
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header - logo*/}
                <div className="flex flex-col items-center text-center gap-2">
                  <a href="/"
                    className="mx-auto block w-fit text-center"
                  >
                    <img src="/logo.svg" alt="logo"/>
                  </a>

                  <h1 className="font-bold text-2xl">Tạo tài khoản Moji</h1>
                  <p className="text-muted-foreground text-balance">Chào mừng bạn! Hãy đăng ký để bắt đầu</p>
                </div>
              {/* họ và tên */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="block text-sm">
                    Họ
                  </Label>
                  <Input
                    type="text"
                    id="lastname"
                    {...register("lastname")}
                  />
                  {/* todo: error message */}
                  {errors.lastname && (
                    <p className="error-message">
                      {errors.lastname.message}
                    </p>
                  )}
                </div>

                 <div className="space-y-2">
                  <Label htmlFor="firstname" className="block text-sm">
                    Tên
                  </Label>
                  <Input
                    type="text"
                    id="firstname"
                    {...register("firstname")}
                  />
                  {/* todo: error message */}
                  {errors.firstname && (
                    <p className="error-message">
                      {errors.firstname.message}
                    </p>
                  )}
                </div>
              </div>
              {/* username */}
               <div className="flex flex-col gap-3">
                  <Label htmlFor="username" className="block text-sm">
                    Tên đăng nhập
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    placeholder="moji"
                    {...register("username")}
                  />
                  {/* todo: error message */}
                  {errors.username && (
                    <p className="error-message">
                      {errors.username.message}
                    </p>
                  )}
                </div>

              {/* email */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="email" className="block text-sm">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="m@gmail.com"
                    {...register("email")}
                  />
                  {/* todo: error message */}
                  {errors.email && (
                    <p className="error-message">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              {/* password */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="password" className="block text-sm">
                    Mật khẩu
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    {...register("password")}
                  />
                  {/* todo: error message */}
                  {errors.password && (
                    <p className="error-message">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              {/* nút đăng ký */}
              <Button
                type="submit"
                className='w-full'
                disabled={isSubmitting}  
              >
                Tạo tài khoản
              </Button>

              <div>
                Đã có tài khoản ? {" "}
                <a
                href="/signin"
                className="underline underline-offset-4">
                  Đăng nhập
                </a>
              </div>

            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholderSignUp.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-sm text-balance px-6 text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *:[a]:underline-offset-4">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và {" "}
         <a href="#">Chính sách bảo mật</a> của chúng tôi.
      </div>
    </div>
  )
}
