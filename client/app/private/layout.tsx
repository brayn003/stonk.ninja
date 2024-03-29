import { MainNav } from "./_components/main-nav";
import { NavSearch } from "./_components/nav-search";
import { UserNav } from "./_components/user-nav";

interface LayoutAppProps {
  children: React.ReactNode;
}

export default function LayoutApp({ children }: LayoutAppProps) {
  return (
    <div className="flex-col flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-8">
          <div className="relative z-20 flex items-center text-lg font-medium mr-4">stonk.ninja</div>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <NavSearch />
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-8 p-8 pt-6 mx-auto w-full xl:w-[1200px]">{children}</div>
    </div>
  );
}
