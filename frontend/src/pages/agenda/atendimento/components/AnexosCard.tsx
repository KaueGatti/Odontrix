import { useRef } from "react";
import { Bone, CloudUpload, FileText, Image, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD_CLASS, SEC_LABEL_CLASS } from "../shared";
import type { AnexoIcone, AnexoItem } from "../types";

const ICONES: Record<AnexoIcone, typeof Bone> = {
  radiografia: Bone,
  foto: Image,
  arquivo: FileText,
};

interface AnexosCardProps {
  anexos: AnexoItem[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}

export function AnexosCard({ anexos, onAdd, onRemove }: AnexosCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) onAdd(files);
    // Permite selecionar o mesmo arquivo novamente
    event.target.value = "";
  }

  return (
    <div className={CARD_CLASS}>
      <div className={SEC_LABEL_CLASS}>Anexos</div>

      <input
        ref={inputRef}
        id="anexos-input"
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mb-3.5 w-full cursor-pointer rounded-[10px] border-[1.5px] border-dashed border-border px-5 py-5 text-center text-[12px] text-muted-foreground transition-colors hover:border-primary hover:bg-primary/[0.04]"
      >
        <CloudUpload
          aria-hidden="true"
          className="mx-auto mb-1.5 block h-5 w-5"
        />
        Arraste arquivos aqui ou clique para selecionar
        <br />
        <span className="text-[10px]">
          Radiografias e fotos vinculadas a esta consulta
        </span>
      </button>

      <div>
        {anexos.map((a, index) => {
          const Icone = ICONES[a.icone] ?? FileText;
          return (
            <div
              key={a.id}
              className={cn(
                "flex items-center gap-2.5 rounded-[10px] border border-border px-3 py-2",
                index < anexos.length - 1 && "mb-2"
              )}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icone className="h-4 w-4" />
              </div>
              <div className="flex-1 truncate text-[12.5px] text-[var(--gray-900)]">
                {a.nome}
                <span className="ml-2 text-[10.5px] text-muted-foreground">
                  {a.tamanho}
                </span>
              </div>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                {a.tipo}
              </span>
              <button
                type="button"
                onClick={() => onRemove(a.id)}
                title="Remover anexo"
                className="inline-flex text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
