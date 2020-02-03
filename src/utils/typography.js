import Typography from 'typography'
import Theme from 'typography-theme-de-young'

Theme.overrideThemeStyles = () => {
  return {
    'a.gatsby-resp-image-link': {
      boxShadow: `none`,
    },
    'code[class*="language-"], pre[class*="language-"]': {
      fontSize: '0.75rem !important',
    },
    '.gatsby-highlight': {
      marginBottom: '1.45rem',
    }
  }
}

// For now, commenting this out.
// Not all fonts in default theme are supported by
// typefaces project
// delete Theme.googleFonts

const typography = new Typography(Theme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
