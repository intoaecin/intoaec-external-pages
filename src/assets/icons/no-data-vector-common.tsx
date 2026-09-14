import * as React from "react";
import { PackageOpen } from "lucide-react";

export const NoDataVector = (props: React.ComponentProps<typeof PackageOpen>) => (
  <PackageOpen strokeWidth={1} color="#BDBDBD" {...props} />
);
