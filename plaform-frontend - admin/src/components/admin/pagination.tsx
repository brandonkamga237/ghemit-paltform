import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function Pagination({
  page,
  pageNo,
  size,
  onPage,
  onSize,
}: {
  page: { totalElements: number; totalPages: number } | null
  pageNo: number
  size: number
  onPage: (p: number) => void
  onSize: (s: number) => void
}) {
  const totalPages = page?.totalPages ?? 0
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-caption text-muted-foreground">
        {page
          ? `${page.totalElements} résultat${page.totalElements > 1 ? "s" : ""} — page ${pageNo + 1}/${Math.max(totalPages, 1)}`
          : "…"}
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Select value={String(size)} onValueChange={(v) => onSize(Number(v))}>
          <SelectTrigger className="w-[110px]" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={pageNo === 0}
          onClick={() => onPage(pageNo - 1)}
          aria-label="Page précédente"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={pageNo + 1 >= totalPages}
          onClick={() => onPage(pageNo + 1)}
          aria-label="Page suivante"
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
