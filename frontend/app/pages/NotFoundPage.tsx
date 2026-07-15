import { EmptyState } from "~/components/common/EmptyState";
import { routePaths } from "~/routes/routePaths";

export default function NotFoundPage() {
  return (
    <EmptyState
      actionLabel="Về trang chủ"
      actionTo={routePaths.home}
      title="Không tìm thấy trang"
      description="Đường dẫn không tồn tại hoặc đã thay đổi."
    />
  );
}
