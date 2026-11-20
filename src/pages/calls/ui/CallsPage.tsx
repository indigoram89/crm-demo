import {PageHeader} from "@/shared/ui/PageHeader";
import {CallsTable} from "@/widgets/calls-table";

export function CallsPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-8 pb-16 sm:px-8">
      <PageHeader description="Входящие звонки через IP-телефонию" title="Звонки" />
      <CallsTable />
    </div>
  );
}
