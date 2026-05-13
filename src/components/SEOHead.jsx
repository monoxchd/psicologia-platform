const SITE_NAME = 'Terapia Conecta'
const SITE_URL = 'https://terapiaconecta.com.br'
const DEFAULT_DESCRIPTION =
  'Plataforma de atendimento psicológico online. Encontre o terapeuta certo para você, em poucos passos.'

const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  type = 'website',
  noindex = false,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const canonical = url || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : SITE_URL)
  const ogImage = image || `${SITE_URL}/apple-touch-icon.png`

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="pt_BR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </>
  )
}

export default SEOHead
