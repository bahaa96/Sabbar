import { ThemeConfig } from 'antd';
import themeVars from './themeVars';

const theme: ThemeConfig = {
  token: {
    fontSize: pixelRemToNumber(themeVars.fontSizeBase),
    colorPrimary: themeVars.primaryColor,
    borderRadius: pixelRemToNumber(themeVars.borderRadiusBase),
  },
  components: {
    Typography: {
      fontSizeHeading1: 24,
    },
    Layout: {
      colorBgHeader: themeVars.primaryColor
    },
    Table: {
      paddingContentVerticalLG: 8,
      controlItemBgActive: themeVars.primaryColor100,
      controlItemBgActiveHover: themeVars.primaryColor100,
      controlItemBgHover: themeVars.primaryColor100,
    },
  },
};

function pixelRemToNumber(unitString: string): number {
  const [value, unit] = [...unitString.matchAll(/([0-9]+)(px|rem)/gi)]?.[0]?.slice(1, 3);
  if (unit) {
    if (unit == 'px') {
      return Number(value);
    } else if (unit == 'rem') {
      return Number(value) * pixelRemToNumber(themeVars.fontSizeBase);
    }
  }
  return Number(value);
}

export default theme;
