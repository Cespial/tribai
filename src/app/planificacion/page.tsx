import { redirect } from "next/navigation";

export default function PlanificacionPage() {
  redirect("/asistente?mode=planificador");
}
