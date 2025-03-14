import { Container } from "@/components/container";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/schema";
import { ContainerWithSize } from "./_modules/container-with-size";
import { NavbarAside } from "./_modules/navbar-aside";
import { NavbarMenu } from "./_modules/navbar-menu";
import { NavbarProvider } from "./_modules/navbar-provider";

export const runtime = "edge";

export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (session?.user.role !== UserRole.ADMIN) {
    return (
      <div className="grid h-dvh place-content-center">
        <h1 className="dark:text-surface text-3xl font-bold">
          Permission Denied
        </h1>
      </div>
    );
  }

  return (
    <NavbarProvider>
      <Container title="Dashboard" leftContent={<NavbarMenu />}>
        <NavbarAside />

        <ContainerWithSize>{children}</ContainerWithSize>
      </Container>
    </NavbarProvider>
  );
}
