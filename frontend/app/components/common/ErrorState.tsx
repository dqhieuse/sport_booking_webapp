import { CircleXmark } from "@gravity-ui/icons";
import { Button } from "@heroui/react";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Không tải được dữ liệu",
  description = "Vui lòng kiểm tra kết nối hoặc thử lại sau.",
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="rounded-[20px] border border-danger/40 bg-card p-6">
      <div className="flex items-start gap-3">
        <CircleXmark className="mt-1 size-5 text-danger" aria-hidden="true" />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {onRetry ? (
            <Button className="mt-4" variant="outline" onPress={onRetry}>
              Thử lại
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
