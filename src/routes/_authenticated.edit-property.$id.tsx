import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { propertiesApi } from "@/lib/api/endpoints";
import { PropertyForm } from "@/components/PropertyForm";
import { typeLabel } from "@/lib/format";
import { propertyTypeOf } from "@/lib/api/property-utils";

export const Route = createFileRoute("/_authenticated/edit-property/$id")({ component: EditPage });

function EditPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["property", Number(id)],
    queryFn: () => propertiesApi.getById(Number(id)),
  });
  if (isLoading) return <div className="container mx-auto px-4 py-12">Učitavanje…</div>;
  if (!data) return <div className="container mx-auto px-4 py-12">Nije pronađeno.</div>;
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Izmena: {typeLabel(propertyTypeOf(data))}</h1>
      <div className="mt-6"><PropertyForm type={propertyTypeOf(data)} existing={data} /></div>
    </div>
  );
}