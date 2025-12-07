// presets.ts
// import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";

import Lara from "@primeuix/themes/lara";

export const MyPreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: "{gray.50}",
      100: "{gray.100}",
      200: "{gray.200}",
      300: "{gray.300}",
      400: "{gray.400}",
      500: "{gray.500}",
      600: "{gray.600}",
      700: "{gray.700}",
      800: "{gray.800}",
      900: "{gray.900}",
      950: "{gray.950}",
    },
    colorScheme: {
      dark: {
        primary: {
          color: "{gray.50}",
          inverseColor: "{gray.950}",
          hoverColor: "{gray.300}",
          activeColor: "{gray.200}",
        },
        highlight: {
          background: "rgba(250, 250, 250, .16)",
          focusBackground: "rgba(250, 250, 250, .24)",
          color: "rgba(255,255,255,.87)",
          focusColor: "rgba(255,255,255,.87)",
        },
      },
    },
  },
});
