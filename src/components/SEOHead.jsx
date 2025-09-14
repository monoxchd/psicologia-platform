import { useEffect } from 'react'

const SEOHead = ({ title, description, image, url, type = 'website' }) => {
  useEffect(() => {
    // Update document title
    document.title = title

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type },
      { property: 'og:url', content: url || window.location.href },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description }
    ]

    if (image) {
      metaTags.push(
        { property: 'og:image', content: image },
        { name: 'twitter:image', content: image }
      )
    }

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`
      let meta = document.querySelector(selector)

      if (!meta) {
        meta = document.createElement('meta')
        if (name) meta.name = name
        if (property) meta.property = property
        document.head.appendChild(meta)
      }

      meta.content = content
    })

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'MindCredits Platform'
    }
  }, [title, description, image, url, type])

  return null
}

export default SEOHead