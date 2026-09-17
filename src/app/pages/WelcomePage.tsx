import { WelcomeScreen } from "../sections/AuthScreens";

export type WelcomePageProps = Parameters<typeof WelcomeScreen>[0];

export function WelcomePage(props: WelcomePageProps) {
  return <WelcomeScreen {...props} />;
}
