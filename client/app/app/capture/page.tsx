import { PageHeader } from "@/components/PageHeader";

import CaptureAction from "./_components/CaptureAction";

export default function PageCapture() {
  return (
    <>
      <PageHeader title="Capture" actions={<CaptureAction />} />
    </>
  );
}
