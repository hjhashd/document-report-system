'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-center"
      offset="5vh"
      mobileOffset={{ top: '2vh' }}
      toastOptions={{
        duration: 3500,
        className: 'toast-base',
        // 自定义成功消息的样式为绿色
        success: {
          className: 'border-green-200 bg-green-50 text-green-800',
          iconClassName: 'text-green-600',
        },
        // 自定义错误消息的样式为红色
        error: {
          className: 'border-red-200 bg-red-50 text-red-800',
          iconClassName: 'text-red-600',
        },
        // 自定义信息消息的样式为蓝色
        info: {
          className: 'border-blue-200 bg-blue-50 text-blue-800',
          iconClassName: 'text-blue-600',
        },
        // 自定义警告消息的样式为黄色
        warning: {
          className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
          iconClassName: 'text-yellow-600',
        },
        // 默认样式为绿色
        className: 'border-green-200 bg-green-50 text-green-800',
        iconClassName: 'text-green-600',
      }}
      style={
        {
          '--normal-bg': '#f0fdf4', // 浅绿色背景
          '--normal-text': '#166534', // 深绿色文字
          '--normal-border': '#bbf7d0', // 绿色边框
          '--success-bg': '#f0fdf4',
          '--success-text': '#166534',
          '--success-border': '#bbf7d0',
          '--error-bg': '#fef2f2',
          '--error-text': '#991b1b',
          '--error-border': '#fecaca',
          '--info-bg': '#eff6ff',
          '--info-text': '#1e40af',
          '--info-border': '#bfdbfe',
          '--warning-bg': '#fffbeb',
          '--warning-text': '#92400e',
          '--warning-border': '#fed7aa',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }