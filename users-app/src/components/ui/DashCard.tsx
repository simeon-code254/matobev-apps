import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./card";

export default function DashCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="rounded-2xl border shadow-md">
      <CardHeader className="px-4 py-3 border-b rounded-t-2xl bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold text-slate-800">{title}</CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}
