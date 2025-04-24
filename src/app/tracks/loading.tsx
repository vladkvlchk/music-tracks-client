import { Disc3Icon } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Disc3Icon className="h-12 w-12 animate-spin" />
    </div>
  );
}
