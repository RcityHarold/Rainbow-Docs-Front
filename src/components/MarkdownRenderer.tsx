import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
  content: string
  className?: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // 标题
        h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800">{children}</h3>,
        h4: ({ children }) => <h4 className="text-lg font-semibold mt-3 mb-2 text-gray-700">{children}</h4>,
        h5: ({ children }) => <h5 className="text-base font-semibold mt-2 mb-1 text-gray-700">{children}</h5>,
        h6: ({ children }) => <h6 className="text-sm font-semibold mt-2 mb-1 text-gray-600">{children}</h6>,
        
        // 段落
        p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
        
        // 列表
        ul: ({ children }) => <ul className="list-disc list-inside mb-4 ml-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-4 ml-4">{children}</ol>,
        li: ({ children }) => <li className="mb-2">{children}</li>,
        
        // 引用
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-400 pl-4 my-4 italic bg-gray-50 py-2">
            {children}
          </blockquote>
        ),
        
        // 代码
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="rounded-md overflow-hidden my-4"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          )
        },
        
        // 链接
        a: ({ href, children }) => (
          <a
            href={href}
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {children}
          </a>
        ),
        
        // 图片
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-lg shadow-md my-4"
          />
        ),
        
        // 表格
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-gray-200">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
        tbody: ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => (
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {children}
          </td>
        ),
        
        // 水平线
        hr: () => <hr className="my-8 border-gray-200" />,
        
        // 删除线
        del: ({ children }) => <del className="text-gray-500">{children}</del>,
        
        // 强调
        em: ({ children }) => <em className="italic">{children}</em>,
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer