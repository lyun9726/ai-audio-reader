import { redirect } from 'next/navigation'

export default function ReaderPage() {
  // 默认重定向到上传页面
  redirect('/reader/upload')
}
