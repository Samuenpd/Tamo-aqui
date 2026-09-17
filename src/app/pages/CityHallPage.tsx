import { PrefeituraDashboard } from "../sections/Dashboard";

export type CityHallPageProps = Parameters<typeof PrefeituraDashboard>[0];

export function CityHallPage(props: CityHallPageProps) {
  return <PrefeituraDashboard {...props} />;
}
