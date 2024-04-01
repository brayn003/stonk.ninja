import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";

import { SettingsNav } from "./_components/settings-nav";

export const metadata: Metadata = {
  title: "Settings",
};

const sidebarNavItems = [
  {
    title: "Integrations",
    href: "/private/settings/integrations",
  },
  // {
  //   title: "Integration Sessions",
  //   href: "/private/settings/sessions",
  // },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
      <PageHeader title="Settings" description="Manage your account settings and set e-mail preferences." />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SettingsNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </>
  );
}
