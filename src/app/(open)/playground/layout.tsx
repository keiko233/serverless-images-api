import { Container } from "@/components/container";

export const runtime = "edge";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Container title="Playground">{children}</Container>;
}
