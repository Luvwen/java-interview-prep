export interface PaletteColor {
  hex: string;
  rgb: string;
  name: string;
}

export interface Palette {
  id: string;
  name: string;
  colors: PaletteColor[];
}

export const COLOR_PALETTES: Palette[] = [
  {
    id: "purple-blue-soft",
    name: "Violeta & Azul Soft",
    colors: [
      { hex: "#E7A8FF", rgb: "231, 168, 255", name: "Rosa Violeta Pastel" },
      { hex: "#BD99E8", rgb: "189, 153, 232", name: "Lavanda Muted" },
      { hex: "#C3B5FF", rgb: "195, 181, 255", name: "Periwinkle Claro" },
      { hex: "#99A0E8", rgb: "153, 160, 232", name: "Azul Violeta Soft" },
      { hex: "#A8C7FF", rgb: "168, 199, 255", name: "Azul Celeste Soft" },
    ],
  },
  {
    id: "neutrals-sage-pink",
    name: "Neutros & Verde Menta",
    colors: [
      { hex: "#C2B7AB", rgb: "194, 183, 171", name: "Beige Taupe" },
      { hex: "#C2CFC7", rgb: "194, 207, 199", name: "Verde Menta Pastel" },
      { hex: "#F7BECC", rgb: "247, 190, 204", name: "Rosa Bebé" },
      { hex: "#FAF1E8", rgb: "250, 241, 232", name: "Crema / Blanco Cálido" },
      { hex: "#393D3B", rgb: "57, 61, 59", name: "Gris Grafito" },
    ],
  },
  {
    id: "pinks-gold-caramel",
    name: "Rosados, Manteca & Caramelo",
    colors: [
      { hex: "#D984A3", rgb: "217, 132, 163", name: "Rosa Viejo" },
      { hex: "#F2ACC6", rgb: "242, 172, 198", name: "Rosa Chicle Claro" },
      { hex: "#F2CEDB", rgb: "242, 206, 219", name: "Rosa Pastel Claro" },
      { hex: "#F2DEA0", rgb: "242, 222, 160", name: "Amarillo Manteca" },
      { hex: "#A67A46", rgb: "166, 122, 70", name: "Marrón Caramelo" },
    ],
  },
];
