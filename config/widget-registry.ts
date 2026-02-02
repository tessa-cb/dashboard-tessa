import { PlaceholderOne } from "@/widgets/placeholder-one";
import { PlaceholderTwo } from "@/widgets/placeholder-two";
import { ComponentType } from "react";

export interface Widget {
  id: string;
  title: string;
  component: ComponentType;
}

export const widgetRegistry: Widget[] = [
  {
    id: "placeholder-one",
    title: "Placeholder One",
    component: PlaceholderOne,
  },
  {
    id: "placeholder-two",
    title: "Placeholder Two",
    component: PlaceholderTwo,
  },
];
