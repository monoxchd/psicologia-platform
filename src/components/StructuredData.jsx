import { useEffect } from 'react'

const StructuredData = ({ data }) => {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    script.id = 'structured-data'

    // Remove any existing structured data script
    const existing = document.querySelector('#structured-data')
    if (existing) {
      existing.remove()
    }

    document.head.appendChild(script)

    return () => {
      const currentScript = document.querySelector('#structured-data')
      if (currentScript) {
        currentScript.remove()
      }
    }
  }, [data])

  return null
}

export default StructuredData