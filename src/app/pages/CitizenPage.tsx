import { CidadaoApp } from "../sections/CitizenApp";

export type CitizenPageProps = Parameters<typeof CidadaoApp>[0];

export function CitizenPage(props: CitizenPageProps) {
  return <CidadaoApp {...props} />;
}
