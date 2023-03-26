
const transparentize = (color: string, percentage: number) => {
  const RGBArray = hexToRgb(color);

  return `rgba(${RGBArray?.join(',')}, ${percentage})`;
};


function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}


export default transparentize;
