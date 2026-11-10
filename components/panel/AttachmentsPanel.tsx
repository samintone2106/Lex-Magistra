import { Panel } from "@/components/ui/Panel";
import { AttachmentList, AttachmentUploader } from "@/components/ui/Attachments";
import { ATTACHMENTS_PER_REQUEST } from "@/lib/validation";
import type { AttachmentView } from "@/lib/types";

/** Bloque "Documentos" de la ficha de una solicitud (cliente, abogado asignado o admin). */
export function AttachmentsPanel({
  requestId,
  items,
  canAdd,
  canRemove,
  fromWizard = false,
  empty,
}: {
  requestId: string;
  items: AttachmentView[];
  /** Solo el cliente dueño y con la solicitud abierta. */
  canAdd: boolean;
  canRemove: boolean;
  fromWizard?: boolean;
  /** Texto cuando no hay documentos. */
  empty: string;
}) {
  return (
    <Panel title="Documentos" id="documentos" meta={`${items.length} de ${ATTACHMENTS_PER_REQUEST}`}>
      <div className="grid gap-5">
        {items.length ? <AttachmentList items={items} canRemove={canRemove} /> : <p className="text-[14px] text-ink-soft">{empty}</p>}
        {canAdd ? <AttachmentUploader requestId={requestId} existing={items.length} fromWizard={fromWizard} /> : null}
      </div>
    </Panel>
  );
}
