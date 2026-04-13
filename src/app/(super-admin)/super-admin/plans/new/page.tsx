import { PlanForm } from "@/components/super-admin/plan-form";

export default function NewPlanPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New Plan</h1>
        <p className="text-sm text-gray-400 mt-1">Define a new pricing tier for AuthorLoft authors.</p>
      </div>
      <PlanForm />
    </div>
  );
}