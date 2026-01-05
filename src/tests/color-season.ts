/**
 * Color Season Analysis Test
 * 
 * The classic "what color season are you?" based on:
 * - Warmth (cool to warm tones)
 * - Saturation (muted to vibrant)
 * - Value/Contrast (light to dark)
 * 
 * This is a well-known system that's easy to sanity-check visually.
 */

import type { VisualTest } from "../core/types";

export const colorSeason: VisualTest = {
  id: "color-season",
  name: "What Color Season Are You?",
  
  dimensions: [
    {
      id: "warmth",
      prompt: "Analyze the PERSON's natural coloring (skin tone, hair color, eye color). Rate their undertone warmth. Cool undertones (pink/blue skin, ashy hair, cool eye colors) score low. Warm undertones (golden/peachy skin, warm hair tones, amber/warm eyes) score high.",
      scale: [1, 10],
    },
    {
      id: "saturation",
      prompt: "Analyze the PERSON's natural coloring. Rate the saturation/intensity of their features. Soft, muted, low-contrast coloring scores low. Vivid, clear, high-contrast coloring (striking eyes, rich hair color) scores high.",
      scale: [1, 10],
    },
    {
      id: "value",
      prompt: "Analyze the PERSON's overall coloring depth. Light features (fair skin, light hair, light eyes) score low. Deep features (deeper skin tones, dark hair, dark eyes) score high.",
      scale: [1, 10],
    },
  ],
  
  categories: [
    {
      id: "spring",
      name: "Spring",
      description: "Warm, bright, and light",
      content: {
        emoji: "🌸",
        headline: "You're a Spring!",
        body: "Your palette radiates warmth and freshness. Think coral sunrises, daffodil yellows, and the cheerful green of new leaves. You bring light and energy to any space.",
        traits: ["Warm", "Bright", "Fresh", "Light", "Energizing"],
        advice: "Lean into warm, clear colors. Avoid anything too muted or dark — your energy is about brightness and warmth together.",
      },
    },
    {
      id: "summer",
      name: "Summer",
      description: "Cool, muted, and light",
      content: {
        emoji: "🌊",
        headline: "You're a Summer!",
        body: "Your palette is soft and sophisticated. Imagine lavender fields, misty mornings, and rose quartz. You create calm, elegant atmospheres with your cool, gentle tones.",
        traits: ["Cool", "Soft", "Muted", "Elegant", "Calming"],
        advice: "Embrace dusty pastels and blue-based colors. Avoid high contrast or overly warm tones — your strength is in soft harmony.",
      },
    },
    {
      id: "autumn",
      name: "Autumn",
      description: "Warm, muted, and rich",
      content: {
        emoji: "🍂",
        headline: "You're an Autumn!",
        body: "Your palette is grounded and earthy. Picture golden hour light, rust-colored leaves, and spiced cider. You bring warmth and depth with your rich, natural tones.",
        traits: ["Warm", "Earthy", "Rich", "Muted", "Grounding"],
        advice: "Go for warm, natural colors with depth. Avoid anything too bright or cool — your power is in warmth with complexity.",
      },
    },
    {
      id: "winter",
      name: "Winter",
      description: "Cool, bright, and deep",
      content: {
        emoji: "❄️",
        headline: "You're a Winter!",
        body: "Your palette is bold and striking. Think midnight blue, pure white snow, and jewel tones. You create dramatic impact with your high-contrast, cool clarity.",
        traits: ["Cool", "Bold", "Clear", "Dramatic", "Striking"],
        advice: "Embrace high contrast and pure, saturated colors. Avoid anything dusty or warm — your strength is in crisp, definitive statements.",
      },
    },
  ],
  
  classify: (scores) => {
    const warmth = scores.warmth ?? 5;
    const saturation = scores.saturation ?? 5;
    const value = scores.value ?? 5;
    
    const isWarm = warmth >= 6;
    const isBright = saturation >= 6;
    
    if (isWarm && isBright) {
      // Warm + Bright = Spring
      return "spring";
    } else if (isWarm && !isBright) {
      // Warm + Muted = Autumn
      return "autumn";
    } else if (!isWarm && !isBright) {
      // Cool + Muted = Summer
      return "summer";
    } else {
      // Cool + Bright = Winter
      return "winter";
    }
  },
};

/**
 * Registry of all available tests.
 */
export const tests: Record<string, VisualTest> = {
  [colorSeason.id]: colorSeason,
};

export function getTest(id: string): VisualTest | undefined {
  return tests[id];
}

// Re-export for convenience
export { colorSeason as defaultTest };
