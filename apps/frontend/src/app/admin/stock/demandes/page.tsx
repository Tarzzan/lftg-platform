"use client";
import { Package, Construction } from "lucide-react";
import Link from "next/link";

export default function DemandesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
        <Construction className="w-10 h-10 text-amber-500" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2 justify-center">
          <Package className="w-6 h-6 text-amber-500" />
          Demandes de stock
        </h1>
        <p className="text-muted-foreground max-w-md">
          Cette fonctionnalité est en cours de développement. Elle permettra de gérer les demandes d&apos;approvisionnement, les bons de commande et les validations par les responsables.
        </p>
      </div>
      <Link href="/admin/stock/articles" className="btn-primary">
        Voir les articles
      </Link>
    </div>
  );
}
