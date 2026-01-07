import { CertsPage } from "@/components/pages";
import { FC, Suspense } from "react";

const Certs: FC = () => {
  return (
    <Suspense fallback={null}>
      <CertsPage />
    </Suspense>
  );
};

export default Certs;
