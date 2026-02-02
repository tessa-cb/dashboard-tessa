import { PlaceholderOne } from "@/widgets/placeholder-one";
import { PlaceholderTwo } from "@/widgets/placeholder-two";
import MissionControl from "@/widgets/mission-control";
import { ComponentType } from "react";

export interface Widget {
  id: string;
  title: string;
  component: ComponentType<{
    refreshKey: number;
    onRefreshed?: (refreshKey: number) => void;
  }>;
}

export const widgetRegistry: Widget[] = [
  {
    id: "mission-control",
    title: "Mission Control",
    component: MissionControl,
  },
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
