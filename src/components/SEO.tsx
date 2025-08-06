import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  author?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  section?: string
}

const SEO: React.FC<SEOProps> = ({
  title = 'Rainbow Docs',
  description = '专业的文档管理和发布平台',
  keywords = '文档管理,知识库,团队协作,文档发布',
  author = 'Rainbow Team',
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  section
}) => {
  const siteUrl = window.location.origin
  const fullUrl = url || window.location.href
  const fullImageUrl = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/logo.png`

  useEffect(() => {
    // 动态更新页面标题
    document.title = title
  }, [title])

  return (
    <Helmet>
      {/* 基础 Meta 标签 */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="Rainbow Docs" />
      <meta property="og:locale" content="zh_CN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* 文章特定的 Meta 标签 */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
        </>
      )}

      {/* JSON-LD 结构化数据 */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'Article' : 'WebSite',
          name: title,
          description: description,
          url: fullUrl,
          image: fullImageUrl,
          author: {
            '@type': 'Organization',
            name: author
          },
          ...(type === 'article' && {
            datePublished: publishedTime,
            dateModified: modifiedTime || publishedTime,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': fullUrl
            }
          }),
          ...(type === 'website' && {
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteUrl}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          })
        })}
      </script>
    </Helmet>
  )
}

export default SEO