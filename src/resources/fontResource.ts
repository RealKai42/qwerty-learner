import i18n from 'i18next'

export interface FontResource {
  key: string
  name: string
  family: string
  fontFiles: { url: string; weight: number; style: string }[]
  /** If true, only show this font when it's detected as available on the local system */
  localOnly?: boolean
}

export const foreignFontResources: FontResource[] = [
  {
    key: 'system-default',
    name: i18n.t('resources.font.systemDefault'),
    family: '',
    fontFiles: [],
  },
  {
    key: 'sf-mono',
    name: 'SF Mono',
    family: '"SF Mono"',
    fontFiles: [],
    localOnly: true,
  },
  {
    key: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: '"JetBrains Mono"',
    fontFiles: [
      { url: '/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2', weight: 400, style: 'normal' },
      { url: '/fonts/jetbrains-mono/JetBrainsMono-Bold.woff2', weight: 700, style: 'normal' },
    ],
  },
  {
    key: 'fira-code',
    name: 'Fira Code',
    family: '"Fira Code"',
    fontFiles: [
      { url: '/fonts/fira-code/FiraCode-Regular.woff2', weight: 400, style: 'normal' },
      { url: '/fonts/fira-code/FiraCode-Regular-LatinExt.woff2', weight: 400, style: 'normal' },
      { url: '/fonts/fira-code/FiraCode-Bold.woff2', weight: 700, style: 'normal' },
      { url: '/fonts/fira-code/FiraCode-Bold-LatinExt.woff2', weight: 700, style: 'normal' },
    ],
  },
  {
    key: 'source-code-pro',
    name: 'Source Code Pro',
    family: '"Source Code Pro"',
    fontFiles: [
      { url: '/fonts/source-code-pro/SourceCodePro-Regular.woff2', weight: 400, style: 'normal' },
      { url: '/fonts/source-code-pro/SourceCodePro-Regular-LatinExt.woff2', weight: 400, style: 'normal' },
      { url: '/fonts/source-code-pro/SourceCodePro-Bold.woff2', weight: 700, style: 'normal' },
      { url: '/fonts/source-code-pro/SourceCodePro-Bold-LatinExt.woff2', weight: 700, style: 'normal' },
    ],
  },
  {
    key: 'ibm-plex-mono',
    name: 'IBM Plex Mono',
    family: '"IBM Plex Mono"',
    fontFiles: [
      { url: '/fonts/ibm-plex-mono/IBMPlexMono-Regular.woff2', weight: 400, style: 'normal' },
      { url: '/fonts/ibm-plex-mono/IBMPlexMono-Bold.woff2', weight: 700, style: 'normal' },
    ],
  },
  {
    key: 'cascadia-code',
    name: 'Cascadia Code',
    family: '"Cascadia Code"',
    fontFiles: [
      { url: '/fonts/cascadia-code/CascadiaCode-Regular.woff2', weight: 400, style: 'normal' },
      { url: '/fonts/cascadia-code/CascadiaCode-Regular-LatinExt.woff2', weight: 400, style: 'normal' },
      { url: '/fonts/cascadia-code/CascadiaCode-Bold.woff2', weight: 700, style: 'normal' },
      { url: '/fonts/cascadia-code/CascadiaCode-Bold-LatinExt.woff2', weight: 700, style: 'normal' },
    ],
  },
]

// Noto Sans SC subset names from fontsource (numbered = Chinese character ranges, latin/latin-ext = Latin)
const NOTO_SANS_SC_SUBSETS = [
  'latin', 'latin-ext',
  '4', '5', '6', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35',
  '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53',
  '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71',
  '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '90', '91', '97', '98', '99', '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110',
  '111', '112', '113', '114', '115', '116', '117', '118', '119',
]

const notoSansScFontFiles: FontResource['fontFiles'] = NOTO_SANS_SC_SUBSETS.flatMap((subset) =>
  [400, 700].map((weight) => ({
    url: `/fonts/noto-sans-sc/noto-sans-sc-${subset}-${weight}-normal.woff2`,
    weight,
    style: 'normal',
  })),
)

export const translateFontResources: FontResource[] = [
  {
    key: 'system-default',
    name: i18n.t('resources.font.systemDefault'),
    family: '',
    fontFiles: [],
  },
  {
    key: 'pingfang-sc',
    name: i18n.t('resources.font.pingfang'),
    family: '"PingFang SC"',
    fontFiles: [],
    localOnly: true,
  },
  {
    key: 'harmonyos-sans',
    name: 'HarmonyOS Sans',
    family: '"HarmonyOS Sans SC"',
    fontFiles: [],
    localOnly: true,
  },
  {
    key: 'mi-sans',
    name: 'Mi Sans',
    family: '"MiSans"',
    fontFiles: [],
    localOnly: true,
  },
  {
    key: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: '"JetBrains Mono"',
    fontFiles: [],
  },
  {
    key: 'noto-sans-sc',
    name: 'Noto Sans SC',
    family: '"Noto Sans SC"',
    fontFiles: notoSansScFontFiles,
  },
]
