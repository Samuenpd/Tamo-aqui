import { LoginScreen } from "../sections/AuthScreens";

export type LoginPageProps = Parameters<typeof LoginScreen>[0];

export function LoginPage(props: LoginPageProps) {
  return <LoginScreen {...props} />;
}
