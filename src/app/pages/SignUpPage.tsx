import { SignUpScreen } from "../sections/AuthScreens";

export type SignUpPageProps = Parameters<typeof SignUpScreen>[0];

export function SignUpPage(props: SignUpPageProps) {
  return <SignUpScreen {...props} />;
}
