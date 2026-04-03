import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  subtext?: ReactNode;
  /** Adds a pulsing red overlay when true — used for the critical alerts card */
  urgent?: boolean;
};

/**
 * Reusable metric card for the dashboard stat row.
 * The urgent prop adds a subtle destructive overlay rather than
 * changing border colors, which keeps layout shifts to zero.
 */
export function StatCard({ label, value, icon, subtext, urgent }: StatCardProps) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
      <Card className="glass-card h-full relative overflow-hidden">
        {urgent && (
          <div className="absolute inset-0 bg-destructive/10 animate-pulse pointer-events-none" />
        )}
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
