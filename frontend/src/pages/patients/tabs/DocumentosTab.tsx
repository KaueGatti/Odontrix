import { useRef, useState } from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Eye, Plus, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

/**
 * Espelha a tabela `attachment`: tipo (FK attachment_type), descrição
 * (nome dado ao documento) e o momento do envio. `fileName` só existe
 * no mock — no backend real isso vira `file_url` após o upload.
 */
interface PatientDocument {
    id: string;
    typeId: string;
    typeLabel: string;
    name: string;
    fileName: string;
    sentAt: string; // ISO
}

// TODO: substituir pela lista real vinda da API (tabela attachment_type)
const ATTACHMENT_TYPES = [
    { id: "1", description: "Radiografia" },
    { id: "2", description: "Anamnese" },
    { id: "3", description: "Receituário" },
    { id: "4", description: "Laudo médico" },
    { id: "5", description: "Outro" },
];

// TODO: substituir pelos documentos reais do paciente (GET /patients/{id}/attachments)
const MOCK_DOCUMENTS: PatientDocument[] = [
    { id: "1", typeId: "2", typeLabel: "Anamnese", name: "Anamnese inicial", fileName: "anamnese-inicial.pdf", sentAt: "2020-02-10T10:30:00" },
    { id: "2", typeId: "1", typeLabel: "Radiografia", name: "Panorâmica", fileName: "panoramica.png", sentAt: "2020-02-10T10:32:00" },
    { id: "3", typeId: "4", typeLabel: "Laudo médico", name: "Laudo ortodôntico", fileName: "laudo-ortodontico.jpeg", sentAt: "2020-02-10T10:35:00" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function getFileFormat(fileName: string): { label: string; className: string } {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "pdf") return { label: "PDF", className: "text-red-500" };
    if (["jpg", "jpeg"].includes(ext)) return { label: "JPEG", className: "text-amber-500" };
    if (["png", "gif", "webp", "bmp"].includes(ext)) return { label: "IMG", className: "text-sky-500" };
    if (["doc", "docx"].includes(ext)) return { label: "DOC", className: "text-blue-600" };
    if (["xls", "xlsx"].includes(ext)) return { label: "XLS", className: "text-emerald-600" };
    return { label: "ARQ", className: "text-muted-foreground" };
}

function formatDateTime(iso: string) {
    const date = new Date(iso);
    const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const day = date.toLocaleDateString("pt-BR");
    return `${time} · ${day}`;
}

/* ------------------------------------------------------------------ */
/* Card de documento                                                    */
/* ------------------------------------------------------------------ */

function DocumentCard({
                          document,
                          onDelete,
                      }: {
    document: PatientDocument;
    onDelete: (document: PatientDocument) => void;
}) {
    const format = getFileFormat(document.fileName);

    return (
        <div className="group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background p-4 text-center shadow-sm transition-shadow hover:shadow-md">
            <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    type="button"
                    aria-label={`Visualizar ${document.name}`}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    // TODO: abrir o arquivo real (file_url) numa nova aba / preview
                    onClick={() => console.log("visualizar", document)}
                >
                    <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    aria-label={`Excluir ${document.name}`}
                    className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(document)}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            <span className={cn("text-lg font-extrabold tracking-tight", format.className)}>
        {format.label}
      </span>

            <div className="w-full">
                <p className="truncate text-[12.5px] font-medium text-foreground" title={document.name}>
                    {document.name}
                </p>
                <p className="text-[11px] text-muted-foreground">{document.typeLabel}</p>
                <p className="mt-1 text-[10.5px] text-muted-foreground">{formatDateTime(document.sentAt)}</p>
            </div>
        </div>
    );
}

function AddDocumentCard({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-primary/30 bg-primary/[0.03] text-center transition-colors hover:bg-primary/[0.06]"
        >
            <Upload className="h-5 w-5 text-primary" />
            <span className="text-[12px] font-medium text-primary">Adicionar Documento</span>
        </button>
    );
}

/* ------------------------------------------------------------------ */
/* Modal de novo documento (Radix Dialog cru, no mesmo padrão do        */
/* RecordFormDialog de Auxiliares.tsx)                                  */
/* ------------------------------------------------------------------ */

function NewDocumentDialog({
                               open,
                               onOpenChange,
                               onSubmit,
                           }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: { typeId: string; name: string; file: File }) => void;
}) {
    const [typeId, setTypeId] = useState("");
    const [name, setName] = useState("");
    const [nameEdited, setNameEdited] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [touched, setTouched] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isValid = !!typeId && name.trim().length > 0 && !!file;

    function reset() {
        setTypeId("");
        setName("");
        setNameEdited(false);
        setFile(null);
        setTouched(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleFileChange(selected: File | null) {
        setFile(selected);
        // Preenche "Nome do documento" com o nome do arquivo (sem extensão) só
        // enquanto o usuário não tiver digitado um nome próprio ali.
        if (selected && !nameEdited) {
            setName(selected.name.replace(/\.[^./]+$/, ""));
        }
    }

    function handleOpenChange(next: boolean) {
        if (!next) reset();
        onOpenChange(next);
    }

    function handleSubmit() {
        setTouched(true);
        if (!isValid || !file) return;
        onSubmit({ typeId, name: name.trim(), file });
        reset();
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogPortal>
                <DialogOverlay className="bg-black/30" />
                <DialogContent className="w-[400px] p-5">
                    <DialogHeader>
                        <DialogTitle>Novo Documento</DialogTitle>
                    </DialogHeader>

                    <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/[0.06] px-3 py-2 text-[11px] text-destructive">
                        Todos os campos são obrigatórios
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <Label className="mb-1.5 block">
                                Tipo de documento <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={typeId}
                                onChange={(e) => setTypeId(e.target.value)}
                                aria-invalid={touched && !typeId}
                            >
                                <option value="" disabled>
                                    Selecione...
                                </option>
                                {ATTACHMENT_TYPES.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.description}
                                    </option>
                                ))}
                            </Select>
                            {touched && !typeId && (
                                <p className="mt-1.5 text-xs text-destructive">Selecione o tipo de documento</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="doc-name" className="mb-1.5 block">
                                Nome do documento <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="doc-name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setNameEdited(true);
                                }}
                                placeholder="Ex: Radiografia panorâmica"
                                aria-invalid={touched && !name.trim()}
                            />
                            {touched && !name.trim() && (
                                <p className="mt-1.5 text-xs text-destructive">Informe um nome para o documento</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="doc-file" className="mb-1.5 block">
                                Arquivo <span className="text-destructive">*</span>
                            </Label>
                            <label
                                htmlFor="doc-file"
                                className="flex h-12 w-full cursor-pointer items-center gap-2.5 rounded-md border border-dashed border-input bg-muted/40 px-3 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted/70"
                            >
                                <Upload className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{file ? file.name : "Clique para selecionar um arquivo"}</span>
                            </label>
                            <input
                                ref={fileInputRef}
                                id="doc-file"
                                type="file"
                                className="sr-only"
                                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                            />
                            {touched && !file && <p className="mt-1.5 text-xs text-destructive">Selecione um arquivo</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit}>
                            <Plus className="h-4 w-4" />
                            Adicionar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Tab                                                                  */
/* ------------------------------------------------------------------ */

export function DocumentosTab() {
    const [documents, setDocuments] = useState<PatientDocument[]>(MOCK_DOCUMENTS);
    const [dialogOpen, setDialogOpen] = useState(false);

    function handleAddDocument({ typeId, name, file }: { typeId: string; name: string; file: File }) {
        const type = ATTACHMENT_TYPES.find((t) => t.id === typeId);
        // TODO: chamar POST /patients/{id}/attachments (multipart) em vez de setState local
        setDocuments((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                typeId,
                typeLabel: type?.description ?? "Outro",
                name,
                fileName: file.name,
                sentAt: new Date().toISOString(),
            },
        ]);
        setDialogOpen(false);
    }

    function handleDeleteDocument(document: PatientDocument) {
        if (!window.confirm(`Excluir "${document.name}"? Essa ação não pode ser desfeita.`)) return;
        // TODO: chamar DELETE /patients/{id}/attachments/{document.id} em vez de setState local
        setDocuments((prev) => prev.filter((d) => d.id !== document.id));
    }

    return (
        <div className="mx-auto flex h-full flex-col px-6 py-4">
            <Card className="flex flex-1 flex-col overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-primary">Documentos</CardTitle>
                        <p className="mt-1 text-[11.5px] text-muted-foreground">
                            Radiografias, anamneses, laudos e demais arquivos do paciente
                        </p>
                    </div>
                    <Button onClick={() => setDialogOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        Novo Documento
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                        {documents.map((document) => (
                            <DocumentCard key={document.id} document={document} onDelete={handleDeleteDocument} />
                        ))}
                        <AddDocumentCard onClick={() => setDialogOpen(true)} />
                    </div>
                </CardContent>
            </Card>

            <NewDocumentDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleAddDocument} />
        </div>
    );
}
